import { productRepository, orderRepository } from "../../repositories/index.js";

/**
 * Chain of Responsibility: each handler decides whether it can answer the
 * message and, if so, produces the reply. Adding an intent = adding a handler.
 */
export class IntentHandler {
  // eslint-disable-next-line no-unused-vars
  canHandle(_query, _user) {
    return false;
  }

  // eslint-disable-next-line no-unused-vars
  async handle(_message, _user, _query) {
    throw new Error("IntentHandler.handle() must be implemented");
  }
}

export class OrderTrackingHandler extends IntentHandler {
  constructor(orders = orderRepository) {
    super();
    this.orders = orders;
  }

  canHandle(query, user) {
    return Boolean(user) && /(track|where|order status|delivery)/.test(query);
  }

  async handle(_message, user) {
    const order = await this.orders.latestForUser(user._id);
    if (!order) return { intent: "track", reply: "You have no orders yet." };
    const step = order.tracking.filter((t) => t.done).at(-1);
    return {
      intent: "track",
      reply: `Order ${order.code} is "${order.status.replace(/_/g, " ")}". Latest update: ${step?.label ?? "placed"}.`,
      data: { order },
    };
  }
}

export class BudgetHandler extends IntentHandler {
  constructor(products = productRepository) {
    super();
    this.products = products;
  }

  canHandle(query) {
    return /(under|below|budget|cheap)/.test(query) && /\d{3,6}/.test(query);
  }

  async handle(_message, _user, query) {
    const max = Number(query.match(/(\d{3,6})/)[1]);
    return {
      intent: "budget",
      reply: `Top picks under ৳${max}:`,
      data: { products: await this.products.underPrice(max, 4) },
    };
  }
}

export class CompareHandler extends IntentHandler {
  constructor(products = productRepository) {
    super();
    this.products = products;
  }

  canHandle(query) {
    return /(compare|vs|difference)/.test(query);
  }

  async handle(message) {
    const items = await this.products.byText(message, 2);
    return {
      intent: "compare",
      reply: items.length >= 2 ? `Comparing ${items[0].name} and ${items[1].name}.` : "Tell me two products to compare.",
      data: { products: items },
    };
  }
}

export class GiftHandler extends IntentHandler {
  constructor(products = productRepository) {
    super();
    this.products = products;
  }

  canHandle(query) {
    return /(gift|present)/.test(query);
  }

  async handle() {
    return {
      intent: "gift",
      reply: "Well-reviewed gift ideas from local sellers:",
      data: { products: await this.products.topRated(4.4, 4) },
    };
  }
}

/** Terminal handler — always matches, keeps the chain total. */
export class FallbackSearchHandler extends IntentHandler {
  constructor(products = productRepository) {
    super();
    this.products = products;
  }

  canHandle() {
    return true;
  }

  async handle(message) {
    const items = message ? await this.products.byText(message, 4) : [];
    return {
      intent: "search",
      reply: items.length ? "Here is what I found:" : "I can track orders, compare products, or find items in your budget.",
      data: { products: items },
    };
  }
}

export const defaultHandlers = [
  new OrderTrackingHandler(),
  new BudgetHandler(),
  new CompareHandler(),
  new GiftHandler(),
  new FallbackSearchHandler(),
];
