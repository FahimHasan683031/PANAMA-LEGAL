import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { LibraryCategoryServices } from "./libraryCategory.service";
import { ILibraryCategory } from "./libraryCategory.interface";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";

const createLibraryCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await LibraryCategoryServices.createLibraryCategory(payload);
    sendResponse<ILibraryCategory>(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Library category created successfully",
        data: result,
    });
});

const getAllLibraryCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryCategoryServices.getAllLibraryCategories(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library categories retrieved successfully",
        data: result,
    });
});

const updateLibraryCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await LibraryCategoryServices.updateLibraryCategory(id, payload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library category updated successfully",
        data: result,
    });
});

const deleteLibraryCategory = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    await LibraryCategoryServices.deleteLibraryCategory(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library category deleted successfully",
        data: null
    });
});

export const LibraryCategoryController = {
    createLibraryCategory,
    getAllLibraryCategories,
    updateLibraryCategory,
    deleteLibraryCategory,
};
