import { IntentHandler } from "./handlers.js";
import { getAiProvider } from "../ai/AiProvider.js";
import { productRepository, orderRepository } from "../../repositories/index.js";

const SYSTEM = `You are the HyperLocal shopping assistant for a Bangladeshi multi-vendor marketplace.
Answer in the language the shopper used (Bangla or English). Be concise (max 90 words).
Use ONLY the catalogue context provided. Prices are in BDT (৳). Prefer local sellers for same-day delivery,
and mention when an online seller is cheaper. Never invent products, prices or order codes.`;

/**
 * LLM handler: sits at the end of the rule chain and answers anything the
 * deterministic handlers could not. It grounds the model with real catalogue
 * and order rows, so replies stay factual (RAG-style context injection).
 */
export class LlmAssistantHandler extends IntentHandler {
  constructor({ provider = null, products = productRepository, orders = orderRepository } = {}) {
    super();
    this._provider = provider;
    this.products = products;
    this.orders = orders;
  }

  get provider() {
    return this._provider ?? getAiProvider();
  }

  canHandle() {
    return this.provider.available;
  }

  async buildContext(message, user) {
    const matches = await this.products.byText(message, 5).catch(() => []);
    const items = matches.length ? matches : await this.products.topRated(4, 5);
    const catalogue = items.map((p) => ({
      name: p.name,
      nameBn: p.nameBn,
      category: p.category,
      price: p.price,
      rating: p.rating,
      slug: p.slug,
      offers: (p.offers ?? []).length,
    }));

    const order = user ? await this.orders.latestForUser(user._id).catch(() => null) : null;
    return {
      catalogue,
      shopper: user ? { name: user.name, coins: user.coins, role: user.role } : null,
      latestOrder: order ? { code: order.code, status: order.status, total: order.total } : null,
      products: items,
    };
  }

  async handle(message, user) {
    const ctx = await this.buildContext(message, user);
    const reply = await this.provider.chat(
      [
        { role: "system", content: SYSTEM },
        {
          role: "system",
          content: `Context JSON: ${JSON.stringify({
            catalogue: ctx.catalogue,
            shopper: ctx.shopper,
            latestOrder: ctx.latestOrder,
          })}`,
        },
        { role: "user", content: message },
      ],
      { temperature: 0.4, maxTokens: 400 },
    );

    return { intent: "llm", reply: reply.trim(), data: { products: ctx.products.slice(0, 3) } };
  }
}
