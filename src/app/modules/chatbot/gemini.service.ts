import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import config from "../../../config";

const genAI = new GoogleGenerativeAI(config.gemini_api_key as string);

/**
 * Format message history for Gemini
 */
const formatHistory = (messages: { role: string; content: string }[]): any[] => {
    return messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));
};

/**
 * Get AI response from Gemini
 */
export const getGeminiResponse = async (
    messages: { role: string; content: string }[],
    initialContext?: string
) => {
    // Using gemini-2.5-flash as requested by the user
    // Forcing apiVersion: 'v1' for stability
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    const history = formatHistory(messages);

    const chat = model.startChat({
        history: history.slice(0, -1), // History without the latest message
    });

    const result = await chat.sendMessage([
        { text: systemPrompt },
        { text: messages[messages.length - 1].content }
    ]);

    const response = await result.response;
    return response.text();
};

/**
 * Get AI streaming response from Gemini (for Socket.io)
 */
export const getGeminiStreamingResponse = async (
    messages: { role: string; content: string }[],
    onChunk: (chunk: string) => void,
    initialContext?: string
) => {
    // Using gemini-2.5-flash as requested by the user
    // Forcing apiVersion: 'v1' for stability
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: 'v1' });

    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    const history = formatHistory(messages);

    const chat = model.startChat({
        history: history.slice(0, -1),
    });

    const result = await chat.sendMessageStream([
        { text: systemPrompt },
        { text: messages[messages.length - 1].content }
    ]);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            onChunk(chunkText);
        }
    }
};
