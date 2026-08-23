import { productRepository, orderRepository } from "../../repositories/index.js";
import { defaultScorers } from "./scorers.js";

/**
 * Composes a taste profile from user signals, then ranks the catalogue with a
 * pluggable list of scorers (Strategy + Composite).
 */
export class RecommendationEngine {
  constructor({ products = productRepository, orders = orderRepository, scorers = defaultScorers } = {}) {
    this.products = products;
    this.orders = orders;
    this.scorers = scorers;
  }

  async buildProfile(user, catalogue) {
    const orders = await this.orders.forUser(user._id);
    const boughtIds = new Set(orders.flatMap((o) => o.items.map((i) => String(i.product))));
    const wishlistIds = new Set((user.wishlist || []).map(String));
    const seed = catalogue.filter((p) => boughtIds.has(String(p._id)) || wishlistIds.has(String(p._id)));
    return {
      boughtIds,
      wishlistIds,
      categories: new Set(seed.map((p) => p.category)),
      brands: new Set(seed.map((p) => p.brand)),
      tags: new Set(seed.flatMap((p) => p.tags || [])),
    };
  }

  async recommend(user, limit = 8) {
    const catalogue = await this.products.all();

    if (!user) {
      return [...catalogue]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit)
        .map((p) => ({ ...p, reason: "Top rated near you" }));
    }

    const profile = await this.buildProfile(user, catalogue);

    return catalogue
      .filter((p) => !profile.boughtIds.has(String(p._id)))
      .map((product) => {
        const results = this.scorers.map((s) => s.score(product, profile));
        const score = results.reduce((sum, r) => sum + r.points, product.rating);
        const reason = results.find((r) => r.reason)?.reason ?? "Popular with neighbours";
        return { ...product, score, reason };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export const recommendationEngine = new RecommendationEngine();
