import { model, Schema } from "mongoose";
import { IArticleCategory } from "./articleCategory.interface";

const articleCategorySchema = new Schema<IArticleCategory>(
    {
        title: {
            type: String,
            required: true,
            unique: true,
            trim: true,
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

export const ArticleCategory = model<IArticleCategory>("ArticleCategory", articleCategorySchema);
