import {
  describe,
  it,
  expect,
  vi
} from "vitest";

import {
  RecommendationEngine
} from "../../../src/services/recommendation/RecommendationEngine.js";


const catalogue = [
  {
    _id: "p1",
    name: "Product 1",
    category: "Rice",
    rating: 4.5
  },
  {
    _id: "p2",
    name: "Product 2",
    category: "Oil",
    rating: 4.0
  },
  {
    _id: "p3",
    name: "Product 3",
    category: "Rice",
    rating: 4.8
  }
];


function makeRepos({
  orders = []
} = {}) {

  return {

    products: {
      all: vi.fn()
        .mockResolvedValue(
          catalogue
        )
    },

    orders: {
      forUser: vi.fn()
        .mockResolvedValue(
          orders
        )
    }

  };
}


describe(
  "RecommendationEngine",
  () => {

    it(
      "returns recommendations for an anonymous user",
      async () => {

        const {
          products,
          orders
        } = makeRepos();

        const engine =
          new RecommendationEngine({
            products,
            orders,
            scorers: []
          });

        const result =
          await engine.recommend(
            null,
            8
          );

        expect(
          result.length
        ).toBeGreaterThan(0);

        expect(
          products.all
        ).toHaveBeenCalled();

      }
    );


    it(
      "excludes products already purchased by the user",
      async () => {

        const {
          products,
          orders
        } = makeRepos({
          orders: [
            {
              items: [
                {
                  product: "p1"
                }
              ]
            }
          ]
        });

        const engine =
          new RecommendationEngine({
            products,
            orders,
            scorers: []
          });

        const result =
          await engine.recommend(
            {
              _id: "user-1"
            },
            8
          );

        expect(
          result.find(
            product =>
              product._id === "p1"
          )
        ).toBeUndefined();

      }
    );


    it(
      "returns products in recommendation order",
      async () => {

        const {
          products,
          orders
        } = makeRepos();

        const engine =
          new RecommendationEngine({
            products,
            orders,
            scorers: []
          });

        const result =
          await engine.recommend(
            null,
            8
          );

        const ids =
          result.map(
            product =>
              product._id
          );

        expect(
          ids.indexOf("p3")
        ).toBeLessThan(
          ids.indexOf("p2")
        );

      }
    );

  }
);