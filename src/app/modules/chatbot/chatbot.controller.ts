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
    const { question, topic } = req.body;
    const result = await ChatbotService.askAI(req.user.authId, question, topic);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'AI response retrieved successfully',
        data: result,
    });
});

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.createCategory(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category created successfully',
        data: result,
    });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.getSingleCategory(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category fetched successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.updateCategory(req.params.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category updated successfully',
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await ChatbotService.deleteCategory(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Category deleted successfully'
    });
});

export const ChatbotController = {
    getAllCategories,
    getChatHistory,
    askAI,
    createCategory,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};
