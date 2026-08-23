import { describe, it, expect, vi } from "vitest";
import { TextSearchStrategy, VoiceSearchStrategy, VisualSearchStrategy } from "../../../src/services/search/strategies.js";

describe("TextSearchStrategy.buildFilter", () => {
  const strategy = new TextSearchStrategy({});

  it("builds a case-insensitive $or filter across name/nameBn/brand for a query", () => {
    const filter = strategy.buildFilter({ q: "rice" });
    expect(filter.$or).toHaveLength(3);
    expect(filter.$or[0].name.test("Fine Rice")).toBe(true);
  });

  it("adds category, maxPrice and minRating constraints when provided", () => {
    const filter = strategy.buildFilter({ category: "Groceries", maxPrice: 200, minRating: 4 });
    expect(filter.category).toBe("Groceries");
    expect(filter.price).toEqual({ $lte: 200 });
    expect(filter.rating).toEqual({ $gte: 4 });
  });

  it("omits constraints that were not provided", () => {
    const filter = strategy.buildFilter({});
    expect(filter).toEqual({});
  });
});

describe("TextSearchStrategy.execute", () => {
  it("passes the built filter, sort, page and limit to the repository", async () => {
    const repository = { search: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const strategy = new TextSearchStrategy(repository);

    await strategy.execute({ q: "milk", sort: "price-asc", page: 2, limit: 10 });

    expect(repository.search).toHaveBeenCalledWith(
      expect.objectContaining({ sort: { price: 1 }, page: 2, limit: 10 }),
    );
  });

  it("falls back to relevance sort for an unknown sort key", async () => {
    const repository = { search: vi.fn().mockResolvedValue({ items: [], total: 0 }) };
    const strategy = new TextSearchStrategy(repository);

    await strategy.execute({ sort: "nonsense" });

    expect(repository.search).toHaveBeenCalledWith(expect.objectContaining({ sort: { rating: -1 } }));
  });

  it("filters to local-seller offers only when localOnly is 'true'", async () => {
    const items = [
      { id: 1, offers: [{ seller: { isLocal: true } }] },
      { id: 2, offers: [{ seller: { isLocal: false } }] },
    ];
    const repository = { search: vi.fn().mockResolvedValue({ items, total: 2 }) };
    const strategy = new TextSearchStrategy(repository);

    const result = await strategy.execute({ localOnly: "true" });

    expect(result.items).toEqual([items[0]]);
    expect(result.total).toBe(2); // total reflects the unfiltered repository count
  });

  it("returns all items when localOnly is not 'true'", async () => {
    const items = [{ id: 1, offers: [{ seller: { isLocal: false } }] }];
    const repository = { search: vi.fn().mockResolvedValue({ items, total: 1 }) };
    const strategy = new TextSearchStrategy(repository);

    const result = await strategy.execute({});
    expect(result.items).toEqual(items);
  });
});

describe("VoiceSearchStrategy.execute", () => {
  it("looks up products by the transcribed text and echoes the transcript back", async () => {
    const repository = { byText: vi.fn().mockResolvedValue([{ id: 1 }]) };
    const strategy = new VoiceSearchStrategy(repository);

    const result = await strategy.execute({ transcript: "chal dal", limit: 5 });

    expect(repository.byText).toHaveBeenCalledWith("chal dal", 5);
    expect(result).toEqual({ transcript: "chal dal", items: [{ id: 1 }] });
  });
});

describe("VisualSearchStrategy.execute", () => {
  it("looks up products by detected image labels", async () => {
    const repository = { byLabels: vi.fn().mockResolvedValue([{ id: 2 }]) };
    const strategy = new VisualSearchStrategy(repository);

    const result = await strategy.execute({ labels: ["tomato"], limit: 3 });

    expect(repository.byLabels).toHaveBeenCalledWith(["tomato"], 3);
    expect(result).toEqual({ labels: ["tomato"], items: [{ id: 2 }] });
  });
});
