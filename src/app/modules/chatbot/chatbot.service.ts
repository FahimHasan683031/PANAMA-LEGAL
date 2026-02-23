import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ChatbotCategory, ChatbotHistory } from './chatbot.model';
import { IChatMessage } from './chatbot.interface';
import { getAIResponse } from './openai.service';
import mongoose from 'mongoose';

const getAllCategories = async () => {
    return await ChatbotCategory.find({ isActive: true });
};

const getChatHistory = async (userId: string) => {
    return await ChatbotHistory.findOne({ user: new mongoose.Types.ObjectId(userId) });
};

const askAI = async (userId: string, userMessage: string, initialContext?: string) => {
    let history = await ChatbotHistory.findOne({ user: new mongoose.Types.ObjectId(userId) });

    if (!history) {
        history = await ChatbotHistory.create({
            user: new mongoose.Types.ObjectId(userId),
            messages: [],
        });
    }

    // Add user message to history
    const userMsg: IChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
    };

    history.messages.push(userMsg);

    // Prepare messages for OpenAI (last 10 messages for context)
    const contextMessages = history.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
    }));

    // Get AI response with optional initial context
    const aiContent = await getAIResponse(contextMessages as any, initialContext);

    if (!aiContent) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to get AI response');
    }

    // Add AI response to history
    const aiMsg: IChatMessage = {
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
    };

    history.messages.push(aiMsg);
    await history.save();

    return aiMsg;
};

export const ChatbotService = {
    getAllCategories,
    getChatHistory,
    askAI,
};
