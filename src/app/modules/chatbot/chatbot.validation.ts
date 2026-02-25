import { z } from 'zod';

const askAISchema = z.object({
    body: z.object({
        question: z.string({
            required_error: 'Question is required',
        }).trim().min(1, 'Question cannot be empty'),
        topic: z.string().optional(),
    }),
});

const createCategorySchema = z.object({
    body: z.object({
        title: z.string({
            required_error: 'Title is required',
        }).trim().min(1, 'Title cannot be empty'),
        icon: z.string().optional(),
        subQuestions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});

const updateCategorySchema = z.object({
    body: z.object({
        title: z.string().trim().min(1).optional(),
        icon: z.string().optional(),
        subQuestions: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
    }),
});

export const ChatbotValidations = {
    askAISchema,
    createCategorySchema,
    updateCategorySchema,
};
