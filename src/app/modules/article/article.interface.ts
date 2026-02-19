import { Types } from "mongoose";

export interface IArticle {
    title: string;
    image: string;
    category: Types.ObjectId;
    description: string;
}
