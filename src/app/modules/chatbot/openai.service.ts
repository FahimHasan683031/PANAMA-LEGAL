import OpenAI from 'openai';
import config from '../../../config';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get AI response from OpenAI
 */
export const getAIResponse = async (
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    initialContext?: string
) => {
    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...messages
        ],
    });

    return completion.choices[0].message.content;
};

/**
 * Get AI streaming response from OpenAI (for Socket.io)
 */
export const getAIStreamingResponse = async (
    messages: OpenAI.Chat.ChatCompletionMessageParam[],
    onChunk: (chunk: string) => void,
    initialContext?: string
) => {
    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            ...messages
        ],
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
            onChunk(content);
        }
    }
};
