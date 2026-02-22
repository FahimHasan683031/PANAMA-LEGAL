import { Model, Types } from 'mongoose';

export type ICaseStatus = 'pending' | 'accepted' | 'cancelled' | 'closed';

export type ICase = {
    _id?: Types.ObjectId;
    title: string;
    citizen: Types.ObjectId;
    lawyer: Types.ObjectId;
    description: string;
    status: ICaseStatus;
    lastMessage?: Types.ObjectId;

}

export type CaseModel = Model<ICase, Record<string, unknown>>;
