import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ArticleServices } from "./article.service";

const createArticle = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleServices.createArticle(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article created successfully",
        data: result,
    });
});

const getAllArticles = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleServices.getAllArticles(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Articles fetched successfully",
        data: result,
    });
});

const getSingleArticle = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleServices.getSingleArticle(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article fetched successfully",
        data: result,
    });
});

const updateArticle = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleServices.updateArticle(req.params.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article updated successfully",
        data: result,
    });
});

const deleteArticle = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleServices.deleteArticle(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article deleted successfully",
        data: result,
    });
});

export const ArticleControllers = {
    createArticle,
    getAllArticles,
    getSingleArticle,
    updateArticle,
    deleteArticle,
};
