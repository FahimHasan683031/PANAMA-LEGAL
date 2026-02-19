import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LibraryServices } from "./library.service";

const createLibrary = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryServices.createLibrary(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library item created successfully",
        data: result,
    });
});

const getAllLibraries = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryServices.getAllLibraries(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Libraries fetched successfully",
        data: result,
    });
});

const getSingleLibrary = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryServices.getSingleLibrary(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library item fetched successfully",
        data: result,
    });
});

const updateLibrary = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryServices.updateLibrary(req.params.id, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library item updated successfully",
        data: result,
    });
});

const deleteLibrary = catchAsync(async (req: Request, res: Response) => {
    const result = await LibraryServices.deleteLibrary(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Library item deleted successfully",
        data: result,
    });
});

export const LibraryControllers = {
    createLibrary,
    getAllLibraries,
    getSingleLibrary,
    updateLibrary,
    deleteLibrary,
};
