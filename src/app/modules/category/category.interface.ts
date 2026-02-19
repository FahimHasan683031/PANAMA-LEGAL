import { Types } from "mongoose";

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  image: string;
  type: 'library' | 'article';
  isActive: boolean;
}
