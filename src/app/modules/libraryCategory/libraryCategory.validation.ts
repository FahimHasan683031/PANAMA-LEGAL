import { z } from "zod";

export const libraryCategoryValidation = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        image: z.string({ required_error: "Image is required" }),
        description: z.string({ required_error: "Description is required" }),
        isActive: z.boolean().optional(),
    }).strict()
});

export const updateLibraryCategoryValidation = z.object({
    body: z.object({
        title: z.string().optional(),
        image: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
    }).strict()
});

export const LibraryCategoryValidations = {
    libraryCategoryValidation,
    updateLibraryCategoryValidation,
};
