import { describe, it, expect, vi } from "vitest";
import { RecommendationEngine } from "../../../src/services/recommendation/RecommendationEngine.js";

const catalogue = [
  { _id: "p1", category: "Groceries", brand: "Pran", tags: ["organic"], price: 100, rating: 4.2 },
  { _id: "p2", category: "Electronics", brand: "Walton", tags: ["gadget"], price: 5000, rating: 4.8 },
  { _id: "p3", category: "Groceries", brand: "Fresh", tags: ["organic", "local"], price: 80, oldPrice: 120, rating: 3.9 },
];

function makeRepos({ orders = [] } = {}) {
  return {
    products: { all: vi.fn().mockResolvedValue(catalogue) },
    orders: { forUser: vi.fn().mockResolvedValue(orders) },
  };
}

describe("RecommendationEngine.recommend (anonymous user)", () => {
  it("returns the catalogue sorted by rating, tagged with a generic reason", async () => {
    const { products, orders } = makeRepos();
    const engine = new RecommendationEngine({ products, orders, scorers: [] });

    const result = await engine.recommend(null, 8);

    expect(result.map((p) => p._id)).toEqual(["p2", "p1", "p3"]);
    expect(result.every((p) => p.reason === "Top rated near you")).toBe(true);
    expect(orders.forUser).not.toHaveBeenCalled();
  });

  it("respects the limit parameter", async () => {
    const { products, orders } = makeRepos();
    const engine = new RecommendationEngine({ products, orders, scorers: [] });

    const result = await engine.recommend(null, 2);
    expect(result).toHaveLength(2);
  });
});

describe("RecommendationEngine.buildProfile", () => {
  it("derives categories/brands/tags from products the user bought or wishlisted", async () => {
    const { products, orders } = makeRepos({
      orders: [{ items: [{ product: "p1" }] }],
    });
    const engine = new RecommendationEngine({ products, orders });
    const user = { _id: "u1", wishlist: ["p3"] };

    const profile = await engine.buildProfile(user, catalogue);

    expect(profile.boughtIds).toEqual(new Set(["p1"]));
    expect(profile.wishlistIds).toEqual(new Set(["p3"]));
    expect(profile.categories).toEqual(new Set(["Groceries"]));
    expect(profile.brands).toEqual(new Set(["Pran", "Fresh"]));
    expect(profile.tags).toEqual(new Set(["organic", "local"]));
  });
});

describe("RecommendationEngine.recommend (logged-in user)", () => {
  it("excludes products the user has already bought", async () => {
    const { products, orders } = makeRepos({ orders: [{ items: [{ product: "p1" }] }] });
    const engine = new RecommendationEngine({ products, orders });
    const user = { _id: "u1", wishlist: [] };

    const result = await engine.recommend(user, 8);

    expect(result.find((p) => p._id === "p1")).toBeUndefined();
  });

  it("scores and ranks remaining products using the configured scorers", async () => {
    const { products, orders } = makeRepos({ orders: [{ items: [{ product: "p1" }] }] });
    const engine = new RecommendationEngine({ products, orders });
    const user = { _id: "u1", wishlist: [] };

    // profile built from p1 (bought): category Groceries, brand Pran, tag organic
    const result = await engine.recommend(user, 8);
    const ids = result.map((p) => p._id);

    // p3 shares category (Groceries) + tag overlap (organic) + price drop -> should outrank p2
    expect(ids.indexOf("p3")).toBeLessThan(ids.indexOf("p2"));
    const p3 = result.find((p) => p._id === "p3");
    expect(p3.reason).toBe("Because you shop Groceries");
  });

  it("falls back to a generic reason when no scorer contributes one", async () => {
    // p2 has no category/brand/tag overlap with an empty profile and no price drop,
    // so every scorer returns null and the engine must fall back to the default reason.
    const { products, orders } = makeRepos({ orders: [] });
    const engine = new RecommendationEngine({ products, orders });
    const user = { _id: "u1", wishlist: [] };

    const result = await engine.recommend(user, 8);
    const p2 = result.find((p) => p._id === "p2");
    expect(p2.reason).toBe("Popular with neighbours");
  });
});
