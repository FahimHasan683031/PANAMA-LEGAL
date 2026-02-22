import { Types } from "mongoose";

export interface IArticleCategory {
    _id: Types.ObjectId;
    title: string;
    isActive: boolean;
}
