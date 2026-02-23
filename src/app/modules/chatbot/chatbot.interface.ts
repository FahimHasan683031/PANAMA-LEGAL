import { Types } from "mongoose";

export interface IChatbotCategory {
    _id: Types.ObjectId;
    title: string;
    icon?: string;
    subQuestions: string[];
    isActive: boolean;
}

export interface IChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface IChatbotHistory {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    messages: IChatMessage[];
}
