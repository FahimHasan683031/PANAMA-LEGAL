import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { IReview } from './review.interface';
import { Review } from './review.model';
import { User } from '../user/user.model';
import { USER_ROLES } from '../../../enum/user';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { updateLawyerRating } from '../../../util/calculateRating';


// create review
const createReview = async (payload: IReview) => {
  // Validate receiver is a Lawyer
  const lawyer = await User.findById(payload.lawyer);
  if (!lawyer || lawyer.role !== USER_ROLES.LAWYER) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Reviews can only be given to Lawyers");
  }

  // Validate reviewer is a Citizen 
  const citizen = await User.findById(payload.citizen);
  if (!citizen || citizen.role !== USER_ROLES.CITIZEN) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Only Citizens are allowed to give reviews");
  }

  // Prevent duplicate reviews from the same citizen to same lawyer
  const existingReview = await Review.findOne({
    citizen: payload.citizen,
    lawyer: payload.lawyer
  });

  if (existingReview) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You have already reviewed this lawyer");
  }

  const result = await Review.create(payload);

  // Update lawyer's aggregated ratings
  await updateLawyerRating(new mongoose.Types.ObjectId(payload.lawyer));

  return result;
};

// get all reviews for a specific lawyer
const getLawyerReviews = async (lawyerId: string, query: Record<string, unknown>) => {
  const reviewQueryBuilder = new QueryBuilder(
    Review.find({ lawyer: new mongoose.Types.ObjectId(lawyerId) }).populate('citizen', 'fullName image'),
    query
  )
    .filter()
    .sort()
    .fields()
    .paginate();

  const reviews = await reviewQueryBuilder.modelQuery;
  const paginationInfo = await reviewQueryBuilder.getPaginationInfo();

  return {
    reviews,
    meta: paginationInfo,
  };
};

// delete review
const deleteReview = async (id: string, requesterId: string) => {
  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Only allow the original reviewer or Admin to delete
  if (review.citizen.toString() !== requesterId) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Not authorized");
  }

  const lawyerId = review.lawyer;
  await Review.findByIdAndDelete(id);

  // Re-calculate ratings
  await updateLawyerRating(new mongoose.Types.ObjectId(lawyerId));

  return { message: "Review deleted successfully" };
};

export const ReviewService = {
  createReview,
  getLawyerReviews,
  deleteReview,
};
