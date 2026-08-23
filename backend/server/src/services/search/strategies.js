import { productRepository } from "../../repositories/index.js";

/**
 * Strategy pattern (SOLID: OCP + LSP).
 * Every search mode implements the same `execute(input)` contract, so a new
 * mode (e.g. barcode search) is added without editing existing code.
 */
export class SearchStrategy {
  constructor(repository = productRepository) {
    this.repository = repository;
  }

  // eslint-disable-next-line no-unused-vars
  async execute(_input) {
    throw new Error("SearchStrategy.execute() must be implemented");
  }
}

const SORTERS = {
  relevance: { rating: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { rating: -1 },
};

export class TextSearchStrategy extends SearchStrategy {
  buildFilter({ q, category, maxPrice, minRating }) {
    const filter = {};
    if (q) filter.$or = [{ name: new RegExp(q, "i") }, { nameBn: new RegExp(q, "i") }, { brand: new RegExp(q, "i") }];
    if (category) filter.category = category;
    if (maxPrice != null) filter.price = { $lte: maxPrice };
    if (minRating != null) filter.rating = { $gte: minRating };
    return filter;
  }

  async execute(input) {
    const { sort = "relevance", page = 1, limit = 24, localOnly } = input;
    const { items, total } = await this.repository.search({
      filter: this.buildFilter(input),
      sort: SORTERS[sort] ?? SORTERS.relevance,
      page,
      limit,
    });
    const visible = localOnly === "true" ? items.filter((p) => p.offers.some((o) => o.seller?.isLocal)) : items;
    return { items: visible, page, total };
  }
}

export class VoiceSearchStrategy extends SearchStrategy {
  async execute({ transcript, limit = 8 }) {
    return { transcript, items: await this.repository.byText(transcript, limit) };
  }
}

export class VisualSearchStrategy extends SearchStrategy {
  async execute({ labels, limit = 8 }) {
    return { labels, items: await this.repository.byLabels(labels, limit) };
  }
}
