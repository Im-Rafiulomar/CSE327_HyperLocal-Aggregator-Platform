import { describe, it, expect } from "vitest";
import {
  CategoryAffinityScorer,
  BrandAffinityScorer,
  TagOverlapScorer,
  PriceDropScorer,
  AlreadyWishlistedScorer,
} from "../../../src/services/recommendation/scorers.js";

const emptyProfile = () => ({
  categories: new Set(),
  brands: new Set(),
  tags: new Set(),
  wishlistIds: new Set(),
});

describe("CategoryAffinityScorer", () => {
  const scorer = new CategoryAffinityScorer();

  it("awards points when the product category matches the profile", () => {
    const profile = { ...emptyProfile(), categories: new Set(["Groceries"]) };
    const result = scorer.score({ category: "Groceries" }, profile);
    expect(result).toEqual({ points: 3, reason: "Because you shop Groceries" });
  });

  it("awards nothing when the category does not match", () => {
    const profile = emptyProfile();
    const result = scorer.score({ category: "Electronics" }, profile);
    expect(result).toEqual({ points: 0, reason: null });
  });
});

describe("BrandAffinityScorer", () => {
  const scorer = new BrandAffinityScorer();

  it("awards points for a known brand", () => {
    const profile = { ...emptyProfile(), brands: new Set(["Pran"]) };
    expect(scorer.score({ brand: "Pran" }, profile)).toEqual({ points: 2, reason: "More from Pran" });
  });

  it("awards nothing for an unknown brand", () => {
    expect(scorer.score({ brand: "Unknown" }, emptyProfile())).toEqual({ points: 0, reason: null });
  });
});

describe("TagOverlapScorer", () => {
  const scorer = new TagOverlapScorer();

  it("awards points when any product tag overlaps the profile tags", () => {
    const profile = { ...emptyProfile(), tags: new Set(["organic", "spicy"]) };
    const result = scorer.score({ tags: ["organic", "imported"] }, profile);
    expect(result).toEqual({ points: 1.5, reason: "Matches your interests" });
  });

  it("awards nothing when there is no overlap", () => {
    const profile = { ...emptyProfile(), tags: new Set(["organic"]) };
    expect(scorer.score({ tags: ["imported"] }, profile)).toEqual({ points: 0, reason: null });
  });

  it("handles a product with no tags array", () => {
    const profile = { ...emptyProfile(), tags: new Set(["organic"]) };
    expect(scorer.score({}, profile)).toEqual({ points: 0, reason: null });
  });
});

describe("PriceDropScorer", () => {
  const scorer = new PriceDropScorer();

  it("awards points when oldPrice is greater than the current price", () => {
    expect(scorer.score({ oldPrice: 500, price: 400 })).toEqual({ points: 1, reason: "Price dropped recently" });
  });

  it("awards nothing when there is no oldPrice", () => {
    expect(scorer.score({ price: 400 })).toEqual({ points: 0, reason: null });
  });

  it("awards nothing when oldPrice is not greater than price", () => {
    expect(scorer.score({ oldPrice: 400, price: 400 })).toEqual({ points: 0, reason: null });
  });
});

describe("AlreadyWishlistedScorer", () => {
  const scorer = new AlreadyWishlistedScorer();

  it("penalizes a product already on the user's wishlist", () => {
    const profile = { ...emptyProfile(), wishlistIds: new Set(["p1"]) };
    expect(scorer.score({ _id: "p1" }, profile)).toEqual({ points: -5, reason: null });
  });

  it("does not penalize a product that is not wishlisted", () => {
    const profile = { ...emptyProfile(), wishlistIds: new Set(["p1"]) };
    expect(scorer.score({ _id: "p2" }, profile)).toEqual({ points: 0, reason: null });
  });
});
