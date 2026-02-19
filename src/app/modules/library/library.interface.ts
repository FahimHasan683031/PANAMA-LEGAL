import { Types } from "mongoose";

export interface ILibrary {
    title: string;
    description: string;
    category: Types.ObjectId;
    image: string;
    file: string;
}
