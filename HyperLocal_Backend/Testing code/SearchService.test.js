import {
  describe,
  it,
  expect,
  vi
} from "vitest";

import {
  SearchService
} from "../../../src/services/search/SearchService.js";

function fakeStrategy(result) {
  return {
    execute: vi.fn()
      .mockResolvedValue(result)
  };
}

describe("SearchService", () => {

  it("dispatches to the registered strategy", async () => {

    const textStrategy =
      fakeStrategy({
        items: ["rice"]
      });

    const service =
      new SearchService(
        new Map([
          ["text", textStrategy]
        ])
      );

    const result =
      await service.search(
        "text",
        { q: "rice" }
      );

    expect(
      textStrategy.execute
    ).toHaveBeenCalledWith({
      q: "rice"
    });

    expect(result).toEqual({
      items: ["rice"]
    });
  });


  it("rejects an unknown search mode", () => {

    const service =
      new SearchService(
        new Map()
      );

    expect(() =>
      service.search(
        "barcode",
        {}
      )
    ).toThrow(
      "Unknown search mode: barcode"
    );
  });


  it("allows a new strategy to be registered", async () => {

    const barcodeStrategy =
      fakeStrategy({
        items: [
          "barcode-product"
        ]
      });

    const service =
      new SearchService(
        new Map()
      );

    service.register(
      "barcode",
      barcodeStrategy
    );

    const result =
      await service.search(
        "barcode",
        {
          code: "123"
        }
      );

    expect(result).toEqual({
      items: [
        "barcode-product"
      ]
    });
  });

});