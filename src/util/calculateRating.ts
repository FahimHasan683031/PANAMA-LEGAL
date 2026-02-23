import mongoose from "mongoose";
import { Review } from "../app/modules/review/review.model";
import { User } from "../app/modules/user/user.model";

export const updateLawyerRating = async (lawyerId: mongoose.Types.ObjectId) => {
  const stats = await Review.aggregate([
    { $match: { lawyer: lawyerId } },
    {
      $group: {
        _id: '$lawyer',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(lawyerId, {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await User.findByIdAndUpdate(lawyerId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};
