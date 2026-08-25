import { BaseRepository } from "./BaseRepository.js";
import { Product } from "../models/Product.js";
import { Seller } from "../models/Seller.js"; // ensures Seller schema is registered for populate

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

  async byText(text, limit = 8) {
    if (!text || !text.trim()) return [];
    try {
      const textMatches = await this.model
        .find({ $text: { $search: text } })
        .populate("offers.seller")
        .limit(limit)
        .lean();
      if (textMatches.length > 0) return textMatches;
    } catch {
      // fallback to regex if text index is not ready or query syntax differs
    }

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const words = text.trim().split(/\s+/).filter(Boolean).map(escapeRegex);
    const rxList = words.map((w) => new RegExp(w, "i"));

    return this.model
      .find({
        $or: [
          { name: { $in: rxList } },
          { nameBn: { $in: rxList } },
          { brand: { $in: rxList } },
          { category: { $in: rxList } },
          { tags: { $in: rxList } },
          { description: { $in: rxList } },
        ],
      })
      .populate("offers.seller")
      .limit(limit)
      .lean();
  }

  byLabels(labels, limit = 8) {
    // Labels come from AI output / user transcripts and may contain regex
    // metacharacters (e.g. "wi-fi", "3.5mm", "(used)") — escape them so a
    // stray character can't throw a SyntaxError or run an arbitrary pattern.
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = labels.filter(Boolean).map((l) => new RegExp(escapeRegex(l), "i"));
    if (rx.length === 0) return [];
    return this.model
      .find({
        $or: [
          { name: { $in: rx } },
          { nameBn: { $in: rx } },
          { brand: { $in: rx } },
          { category: { $in: rx } },
          { tags: { $in: rx } },
          { description: { $in: rx } },
        ],
      })
      .populate("offers.seller")
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
