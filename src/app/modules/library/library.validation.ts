import { z } from "zod";

const createLibraryZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        description: z.string({ required_error: "Description is required" }),
        category: z.string({ required_error: "Category is required" }),
        image: z.string().optional(),
        file: z.string().optional(),
    }),
});

const updateLibraryZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        image: z.string().optional(),
        file: z.string().optional(),
    }),
});

export const LibraryValidations = {
    createLibraryZodSchema,
    updateLibraryZodSchema,
};
