import { Types } from 'mongoose'

export interface IReview {
  _id?: Types.ObjectId;
  citizen: Types.ObjectId;
  lawyer: Types.ObjectId;
  rating: number;
  comment?: string;
}
