import { z } from 'zod';

export const createCaseZod = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        lawyer: z.string().min(1, 'Lawyer ID is required'),
        description: z.string().min(1, 'Description is required'),
    }),
});

export const updateCaseStatusZod = z.object({
    body: z.object({
        status: z.enum(['pending', 'accepted', 'cancelled', 'closed'], {
            required_error: 'Status is required',
        }),
    }),
});
