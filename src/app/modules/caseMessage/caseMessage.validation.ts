import { z } from 'zod';

export const sendMessageZod = z.object({
    body: z.object({
        caseId: z.string({
            required_error: 'caseId is required'
        }),
        text: z.string().optional(),
        files: z.array(z.string()).optional(),
    }).refine(
        (data) => {
            const hasText = typeof data.text === 'string' && data.text.trim().length > 0;
            const hasFiles = Array.isArray(data.files) && data.files.length > 0;
            return hasText || hasFiles;
        },
        {
            message: 'Must provide either non-empty text or files',
        }
    ),
});

export const getMessageZod = z.object({
    params: z.object({
        id: z.string().min(1, 'Case ID is required'),
    }),
});

export const CaseMessageValidation = {
    sendMessageZod,
    getMessageZod
};
