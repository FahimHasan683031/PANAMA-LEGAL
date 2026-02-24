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
    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    // Note: The user had gemini-2.5-flash, but current stable is gemini-1.5-flash
    // Using gemini-1.5-flash for reliability unless 2.5 is specific to user's environment
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: systemPrompt
    });

    const fullHistory = formatHistory(messages);
    let chatHistory = fullHistory.slice(0, -1);

    // Gemini history MUST start with 'user' role
    const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
    if (firstUserIndex !== -1) {
        chatHistory = chatHistory.slice(firstUserIndex);
    } else {
        chatHistory = [];
    }

    const chat = model.startChat({
        history: chatHistory,
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);

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
    const systemPrompt = `You are a helpful and professional legal assistant for 'Panama Legal'. 
        Your goal is to provide accurate and helpful information about Panamanian law. 
        Keep your responses concise and professional. 
        If you are unsure about something, recommend the user to contact a specialist lawyer through the application.
        ${initialContext ? `The user is currently interested in: ${initialContext}. Please tailor your initial responses to this topic.` : ''}`;

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
    });

    const fullHistory = formatHistory(messages);
    let chatHistory = fullHistory.slice(0, -1);

    // Gemini history MUST start with 'user' role
    const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
    if (firstUserIndex !== -1) {
        chatHistory = chatHistory.slice(firstUserIndex);
    } else {
        chatHistory = [];
    }

    const chat = model.startChat({
        history: chatHistory,
    });

    const result = await chat.sendMessageStream(messages[messages.length - 1].content);

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            onChunk(chunkText);
        }
    }
};
