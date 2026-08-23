/**
 * Each scorer is an independent rule (SRP) with the same interface (LSP).
 * The engine iterates over the list, so new signals are added by appending a
 * scorer instead of modifying the engine (OCP).
 */
export class Scorer {
  // eslint-disable-next-line no-unused-vars
  score(_product, _profile) {
    return { points: 0, reason: null };
  }
}

export class CategoryAffinityScorer extends Scorer {
  score(product, profile) {
    return profile.categories.has(product.category)
      ? { points: 3, reason: `Because you shop ${product.category}` }
      : { points: 0, reason: null };
  }
}

export class BrandAffinityScorer extends Scorer {
  score(product, profile) {
    return profile.brands.has(product.brand)
      ? { points: 2, reason: `More from ${product.brand}` }
      : { points: 0, reason: null };
  }
}

export class TagOverlapScorer extends Scorer {
  score(product, profile) {
    return (product.tags || []).some((t) => profile.tags.has(t))
      ? { points: 1.5, reason: "Matches your interests" }
      : { points: 0, reason: null };
  }
}

export class PriceDropScorer extends Scorer {
  score(product) {
    return product.oldPrice && product.oldPrice > product.price
      ? { points: 1, reason: "Price dropped recently" }
      : { points: 0, reason: null };
  }
}

export class AlreadyWishlistedScorer extends Scorer {
  score(product, profile) {
    return profile.wishlistIds.has(String(product._id)) ? { points: -5, reason: null } : { points: 0, reason: null };
  }
}

export const defaultScorers = [
  new CategoryAffinityScorer(),
  new BrandAffinityScorer(),
  new TagOverlapScorer(),
  new PriceDropScorer(),
  new AlreadyWishlistedScorer(),
];
