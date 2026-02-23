import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  // Inject current citizen ID as the reviewer
  req.body.citizen = req.user.authId;

  const result = await ReviewService.createReview(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getLawyerReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getLawyerReviews(req.params.id, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(req.params.id, req.user.authId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getLawyerReviews,
  deleteReview,
};
