import { JwtPayload } from "jsonwebtoken";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/QueryBuilder";
import axios from "axios";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

/**
 * Verify Apple In-App Purchase Receipt
 */
const verifyAppleReceipt = async (receiptData: string): Promise<any> => {
    // In production, use: https://buy.itunes.apple.com/verifyReceipt
    // In sandbox, use: https://sandbox.itunes.apple.com/verifyReceipt
    const url = "https://sandbox.itunes.apple.com/verifyReceipt";

    try {
        const response = await axios.post(url, {
            "receipt-data": receiptData,
            // "password": "your_app_specific_shared_secret" // If required for auto-renewable subscriptions
        });

        if (response.data.status !== 0) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Apple verification failed with status: ${response.data.status}`);
        }

        return response.data;
    } catch (error) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to connect to Apple verification server");
    }
};

/**
 * Verify Google In-App Purchase Token
 */
const verifyGoogleToken = async (productId: string, token: string): Promise<any> => {
    // Placeholder for Google Play Developer API verification.
    console.log(`Verifying Google token for product ${productId}: ${token}`);

    return {
        expiryTimeMillis: Date.now() + 30 * 24 * 60 * 60 * 1000,
        paymentState: 1
    };
};

const processIAPPurchase = async (
    user: JwtPayload,
    payload: { platform: 'apple' | 'google', receipt: string, productId: string }
) => {
    let expiryDate: Date;
    let transactionId: string;

    if (payload.platform === 'apple') {
        const result = await verifyAppleReceipt(payload.receipt);
        const latestReceipt = result.latest_receipt_info ? result.latest_receipt_info[0] : result.receipt.in_app[0];
        expiryDate = new Date(parseInt(latestReceipt.expires_date_ms));
        transactionId = latestReceipt.transaction_id;
    } else {
        const result = await verifyGoogleToken(payload.productId, payload.receipt);
        expiryDate = new Date(result.expiryTimeMillis);
        transactionId = payload.receipt;
    }


    // Update User
    await User.findByIdAndUpdate(user.authId || user.id, {
        isSubscribed: true,
        subscriptionExpiry: expiryDate
    });

    // Create Subscription record
    const subscriptionData = {
        user: user.authId || user.id,
        customerId: user.authId || user.id,
        price: 0,
        subscriptionId: transactionId,
        platform: payload.platform,
        purchaseToken: payload.receipt,
        productId: payload.productId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: expiryDate,
        status: "active" as const
    };

    return await Subscription.create(subscriptionData);
};

const subscriptionDetailsFromDB = async (user: JwtPayload): Promise<ISubscription | {}> => {
    const subscription = await Subscription.findOne({ user: user.authId || user.id }).sort({ createdAt: -1 }).lean();
    if (!subscription) {
        return {};
    }
    return subscription;
};

const subscriptionsFromDB = async (query: Record<string, unknown>) => {
    const result = new QueryBuilder(Subscription.find(), query).paginate();
    const subscriptions = await result.modelQuery
        .populate([
            {
                path: "user",
                select: "fullName email"
            }
        ])
        .lean();
    const pagination = await result.getPaginationInfo();

    return { subscriptions, pagination };
};

export const SubscriptionService = {
    subscriptionDetailsFromDB,
    subscriptionsFromDB,
    processIAPPurchase
};
