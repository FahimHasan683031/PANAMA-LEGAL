import { model, Schema } from "mongoose";
import { ILibrary } from "./library.interface";

const librarySchema = new Schema<ILibrary>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'LibraryCategory',
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const LibraryModel = model<ILibrary>("Library", librarySchema);
