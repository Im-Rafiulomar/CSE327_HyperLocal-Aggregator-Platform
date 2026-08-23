import { describe, it, expect, vi } from "vitest";
import { SearchService } from "../../../src/services/search/SearchService.js";

function fakeStrategy(result) {
  return { execute: vi.fn().mockResolvedValue(result) };
}

describe("SearchService", () => {
  it("dispatches to the registered strategy for a given mode", async () => {
    const textStrategy = fakeStrategy({ items: ["a"] });
    const service = new SearchService(new Map([["text", textStrategy]]));

    const result = await service.search("text", { q: "rice" });

    expect(textStrategy.execute).toHaveBeenCalledWith({ q: "rice" });
    expect(result).toEqual({ items: ["a"] });
  });

  it("throws a 400 ApiError for an unknown mode", () => {
    const service = new SearchService(new Map());
    expect(() => service.search("barcode", {})).toThrow("Unknown search mode: barcode");
  });

  it("allows registering additional strategies at runtime", async () => {
    const service = new SearchService(new Map());
    const barcodeStrategy = fakeStrategy({ items: ["b"] });

    service.register("barcode", barcodeStrategy);
    const result = await service.search("barcode", { code: "123" });

    expect(result).toEqual({ items: ["b"] });
  });

  it("register() returns the service instance for chaining", () => {
    const service = new SearchService(new Map());
    const returned = service.register("x", fakeStrategy({}));
    expect(returned).toBe(service);
  });
});
