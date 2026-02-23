import { Model, Types } from 'mongoose';

export type ICaseMessage = {
    _id?: Types.ObjectId;
    caseId: Types.ObjectId;
    sender: Types.ObjectId;
    text?: string;
    files?: string[];
    readBy: Types.ObjectId[];
};

export type CaseMessageModel = Model<ICaseMessage, Record<string, unknown>>;
