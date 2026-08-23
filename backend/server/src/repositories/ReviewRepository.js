import { BaseRepository } from "./BaseRepository.js";
import { Review } from "../models/Review.js";

export class ReviewRepository extends BaseRepository {
  constructor(model = Review) {
    super(model);
  }

  forProduct(productId) {
    return this.model.find({ product: productId }).sort({ createdAt: -1 }).lean();
  }
}

export const reviewRepository = new ReviewRepository();
