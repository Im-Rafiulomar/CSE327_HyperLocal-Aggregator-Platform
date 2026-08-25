import { getAiProvider } from "./AiProvider.js";
import { productRepository } from "../../repositories/index.js";
import { badRequest } from "../../utils/errors.js";

/**
 * Image understanding for camera / photo product search.
 *
 * Strategy pattern: the labelling step has an AI implementation and a
 * deterministic offline implementation with the same contract, so the route
 * keeps working when no AI key is configured (OCP + LSP).
 */
export class LabelStrategy {
  // eslint-disable-next-line no-unused-vars
  async detect(_image) {
    throw new Error("LabelStrategy.detect() must be implemented");
  }
}

const PROMPT = `You are a product recognition model for a Bangladeshi marketplace.
Look at the photo and identify the retail product. Reply with strict JSON only:
{"labels":["3-6 lowercase search keywords"],"category":"one of electronics, grocery, fashion, beauty, home, sports, books, other","query":"short search phrase a shopper would type","description":"one sentence about the item","confidence":0.0-1.0}`;

export class AiLabelStrategy extends LabelStrategy {
  constructor(provider = getAiProvider()) {
    super();
    this.provider = provider;
  }

  get usable() {
    return this.provider.available && typeof this.provider.describeImage === "function";
  }

  async detect(image) {
    const raw = await this.provider.describeImage(image, PROMPT);
    const cleaned = raw.replace(/^```(?:json)?|```$/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("No JSON object found in vision response");
    }
    const json = JSON.parse(match[0]);
    return {
      labels: (json.labels ?? []).map((l) => String(l).toLowerCase().trim()).filter(Boolean).slice(0, 6),
      category: json.category ?? "",
      query: json.query ?? "",
      description: json.description ?? "",
      confidence: Number(json.confidence ?? 0.7),
      source: "ai-vision",
    };
  }
}

/** Fallback: colour/shape heuristics are impossible server-side without an AI
 *  model, so we degrade gracefully to the client-provided hint labels. */
export class HintLabelStrategy extends LabelStrategy {
  async detect(_image, hints = []) {
    const labels = hints.map((h) => String(h).toLowerCase()).filter(Boolean);
    return {
      labels: labels.length ? labels : ["popular"],
      category: "",
      query: labels.join(" "),
      description: "Matched on the keywords sent by your device (AI vision is not configured).",
      confidence: 0.3,
      source: "heuristic",
    };
  }
}

export class VisionService {
  constructor({ products = productRepository, ai = new AiLabelStrategy(), fallback = new HintLabelStrategy() } = {}) {
    this.products = products;
    this.ai = ai;
    this.fallback = fallback;
  }

  /** @param {{image?: string, labels?: string[], limit?: number}} input */
  async search({ image, labels = [], limit = 8 }) {
    if (!image && labels.length === 0) throw badRequest("Send an image or at least one label");

    let detection;
    if (image && this.ai.usable) {
      try {
        detection = await this.ai.detect(image);
      } catch (err) {
        detection = { ...(await this.fallback.detect(image, labels)), warning: err.message };
      }
    } else {
      detection = await this.fallback.detect(image, labels);
    }

    const terms = [...new Set([...detection.labels, ...labels.map((l) => l.toLowerCase())])];
    let items = await this.products.byLabels(terms, limit);
    if (items.length === 0 && detection.query) items = await this.products.byText(detection.query, limit);
    if (items.length === 0) items = await this.products.topRated(4, limit);

    return { ...detection, items };
  }
}

export const visionService = new VisionService();
