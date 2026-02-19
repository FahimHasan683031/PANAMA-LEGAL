import { z } from "zod";

const createArticleZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        category: z.string({ required_error: "Category is required" }),
        description: z.string({ required_error: "Description is required" }),
        image: z.string().optional(),
    }),
});

const updateArticleZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
    }),
});

export const ArticleValidations = {
    createArticleZodSchema,
    updateArticleZodSchema,
};
