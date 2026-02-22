import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { ArticleCategoryServices } from "./articleCategory.service";
import { IArticleCategory } from "./articleCategory.interface";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";

const createArticleCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await ArticleCategoryServices.createArticleCategory(payload);
    sendResponse<IArticleCategory>(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Article category created successfully",
        data: result,
    });
});

const getAllArticleCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await ArticleCategoryServices.getAllArticleCategories(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article categories retrieved successfully",
        data: result,
    });
});

const deleteArticleCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await ArticleCategoryServices.deleteArticleCategory(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Article category deleted successfully",
        data: null
    });
});

export const ArticleCategoryController = {
    createArticleCategory,
    getAllArticleCategories,
    deleteArticleCategory,
};
