import mongoose from "mongoose"
import { IReview } from "./review.interface"

const ReviewSchema = new mongoose.Schema<IReview>({
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String
  },
}, {
  timestamps: true,
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
