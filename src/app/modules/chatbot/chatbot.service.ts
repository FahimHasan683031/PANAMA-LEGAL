import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ChatbotCategory, ChatbotHistory } from './chatbot.model';
import { IChatbotCategory, IChatMessage } from './chatbot.interface';
import { getGeminiResponse } from './gemini.service';
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

    // Reset history if a new initial context is provided
    if (initialContext) {
        history.messages = [];
    }

    // Add user message to history
    const userMsg: IChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
    };

    history.messages.push(userMsg);

    // Prepare messages for AI (last 10 messages for context)
    const contextMessages = history.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
    }));

    // Get AI response
    const aiContent = await getGeminiResponse(contextMessages, initialContext);

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

    // Ensure only last 10 messages are saved to prevent memory/token bloat
    if (history.messages.length > 10) {
        history.messages = history.messages.slice(-10);
    }

    await history.save();

    // Emit socket event for real-time update
    //@ts-ignore
    const io = global.io;
    if (io) {
        io.emit(`getChatbotMessage::${userId}`, aiMsg);
    }

    return aiMsg;
};

const createCategory = async (payload: IChatbotCategory) => {
    return await ChatbotCategory.create(payload);
};

const getSingleCategory = async (id: string) => {
    const result = await ChatbotCategory.findById(id);
    if (!result) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Chatbot category not found');
    }
    return result;
};

const updateCategory = async (id: string, payload: Partial<IChatbotCategory>) => {
    const isExist = await ChatbotCategory.findById(id);
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Chatbot category not found');
    }

    return await ChatbotCategory.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCategory = async (id: string) => {
    const isExist = await ChatbotCategory.findById(id).lean();
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Chatbot category not found');
    }

    return await ChatbotCategory.findByIdAndDelete(id);
};

export const ChatbotService = {
    getAllCategories,
    getChatHistory,
    askAI,
    createCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
