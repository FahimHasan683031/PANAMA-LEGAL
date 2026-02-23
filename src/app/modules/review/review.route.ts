import express from 'express';
import { USER_ROLES } from '../../../enum/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';

const router = express.Router();

// Get reviews for a specific lawyer
router.get('/:id', ReviewController.getLawyerReviews);

// Create a review (Only Citizen can review)
router.post(
  '/',
  auth(USER_ROLES.CITIZEN),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

// Delete a review (Only the reviewer or potentially admin)
router.delete('/:id', auth(USER_ROLES.CITIZEN), ReviewController.deleteReview);

export const ReviewRoutes = router;
