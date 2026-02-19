import { z } from "zod";

// Base service validation 
const baseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  image: z.string().min(1, "Image URL is required"),
  isActive: z.boolean().default(true),
});

// Create service validation
export const createCategoryZod = z.object({
  body: baseCategorySchema.extend({
    type: z.enum(['library', 'article'], { required_error: "Type is required" }),
  }).strict(),
});

// Update service validation
export const updateCategoryZod = z.object({
  body: baseCategorySchema.partial().strict(),
});




