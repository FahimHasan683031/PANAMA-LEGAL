import { z } from 'zod';

const askAISchema = z.object({
    body: z.object({
        question: z.string({
            required_error: 'Question is required',
        }).trim().min(1, 'Question cannot be empty'),
        topic: z.string().optional(),
    }),
});

export const ChatbotValidations = {
    askAISchema,
};
