import { Types } from "mongoose";

export interface ILibraryCategory {
    _id: Types.ObjectId;
    title: string;
    image: string;
    description: string;
    isActive: boolean;
}
