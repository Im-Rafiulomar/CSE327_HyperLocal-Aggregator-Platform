import { BaseRepository } from "./BaseRepository.js";
import { Product } from "../models/Product.js";

/** Product persistence. Only this class knows how products are queried. */
export class ProductRepository extends BaseRepository {
  constructor(model = Product) {
    super(model);
  }

  async search({ filter = {}, sort = { rating: -1 }, page = 1, limit = 24 }) {
    const items = await this.model
      .find(filter)
      .populate("offers.seller")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return { items, total: await this.count(filter) };
  }

  findBySlug(slug) {
    return this.model.findOne({ slug }).populate("offers.seller").lean();
  }

  findBySlugDocument(slug) {
    return this.model.findOne({ slug });
  }

  categories() {
    return this.model.distinct("category");
  }

  all() {
    return this.model.find().lean();
  }

  byText(text, limit = 8) {
    return this.model.find({ $text: { $search: text } }).limit(limit).lean();
  }

  byLabels(labels, limit = 8) {
    const rx = labels.map((l) => new RegExp(l, "i"));
    return this.model
      .find({ $or: [{ name: { $in: rx } }, { category: { $in: rx } }, { tags: { $in: rx } }] })
      .limit(limit)
      .lean();
  }

  underPrice(max, limit = 4) {
    return this.model.find({ price: { $lte: max } }).sort({ rating: -1 }).limit(limit).lean();
  }

  topRated(minRating = 4.4, limit = 4) {
    return this.model.find({ rating: { $gte: minRating } }).limit(limit).lean();
  }
}

export const productRepository = new ProductRepository();
