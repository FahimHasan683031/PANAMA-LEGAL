import { Model, Types } from 'mongoose';

export type ISubscription = {
    _id?: string;
    user: Types.ObjectId;
    customerId: string;
    price: number;
    trxId?: string;
    subscriptionId: string;
    platform: 'apple' | 'google';
    purchaseToken?: string;
    productId: string;
    status: 'expired' | 'active' | 'cancel' | 'pending';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    invoice?: string;
};



export type SubscriptionModel = Model<ISubscription, Record<string, unknown>>;