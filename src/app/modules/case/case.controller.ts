import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { CaseService } from "./case.service";
import { JwtPayload } from "jsonwebtoken";

const createCase = catchAsync(async (req: Request, res: Response) => {
    const payload = {
        ...req.body,
        citizen: req.user.authId,
        status: 'pending'
    };
    const result = await CaseService.createCaseToDB(payload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Case Created Successfully',
        data: result,
    });
});

const getCases = catchAsync(async (req: Request, res: Response) => {
    const result = await CaseService.getCasesFromDB(
        req.user as JwtPayload,
        req.query
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Cases Retrieved Successfully',
        data: result.data,
        meta: result.pagination
    });
});

const getCaseById = catchAsync(async (req: Request, res: Response) => {
    const result = await CaseService.getCaseByIdFromDB(req.params.id, req.user as JwtPayload);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Case Retrieved Successfully',
        data: result,
    });
});

const updateCaseStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await CaseService.updateCaseStatusToDB(
        req.params.id,
        req.user as JwtPayload,
        req.body.status
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Case Status Updated Successfully',
        data: result,
    });
});

export const CaseController = {
    createCase,
    getCases,
    getCaseById,
    updateCaseStatus
};
