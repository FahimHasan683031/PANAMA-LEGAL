import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ChatbotService } from './chatbot.service';

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.getAllCategories();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chatbot categories retrieved successfully',
        data: result,
    });
});

const getChatHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.getChatHistory(req.user.authId);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chat history retrieved successfully',
        data: result,
    });
});

const askAI = catchAsync(async (req: Request, res: Response) => {
    const { message, topic } = req.body;
    const result = await ChatbotService.askAI(req.user.authId, message, topic);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'AI response retrieved successfully',
        data: result,
    });
});

export const ChatbotController = {
    getAllCategories,
    getChatHistory,
    askAI,
};
