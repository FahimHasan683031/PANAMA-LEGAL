import { model, Schema } from "mongoose";
import { ILibraryCategory } from "./libraryCategory.interface";

const libraryCategorySchema = new Schema<ILibraryCategory>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export const LibraryCategory = model<ILibraryCategory>("LibraryCategory", libraryCategorySchema);
