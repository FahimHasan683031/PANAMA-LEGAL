import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const subscriptions = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.subscriptionsFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscriptions retrieved successfully",
        data: result
    })
});

const subscriptionDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.subscriptionDetailsFromDB(req.user as JwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription details retrieved successfully",
        data: result
    })
});

const verifyPurchase = catchAsync(async (req: Request, res: Response) => {
    const result = await SubscriptionService.processIAPPurchase(req.user as JwtPayload, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Purchase verified and subscription activated successfully",
        data: result
    })
});

export const SubscriptionController = {
    subscriptions,
    subscriptionDetails,
    verifyPurchase
};
