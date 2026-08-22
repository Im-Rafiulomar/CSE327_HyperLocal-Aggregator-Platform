import { defaultHandlers, FallbackSearchHandler } from "./handlers.js";
import { LlmAssistantHandler } from "./LlmHandler.js";

/**
 * Runs the intent Chain of Responsibility and returns the first handler that
 * both accepts the message and succeeds. Rule handlers run first (fast and
 * deterministic), then the grounded LLM handler, then the search fallback.
 */
export class AssistantService {
  constructor(handlers = AssistantService.buildDefaultChain()) {
    this.handlers = handlers;
  }

  static buildDefaultChain() {
    const rules = defaultHandlers.filter((h) => !(h instanceof FallbackSearchHandler));
    return [...rules, new LlmAssistantHandler(), new FallbackSearchHandler()];
  }

  use(handler) {
    this.handlers = [handler, ...this.handlers];
    return this;
  }

  async answer(message, user) {
    const query = (message || "").toLowerCase();
    let lastError = null;

    for (const handler of this.handlers) {
      if (!handler.canHandle(query, user)) continue;
      try {
        return await handler.handle(message, user, query);
      } catch (err) {
        // a failing handler (e.g. AI outage) must not break the chain
        lastError = err;
        console.warn("[assistant] handler failed:", err.message);
      }
    }

    return {
      intent: "error",
      reply: "I could not answer that right now. Please try again in a moment.",
      data: { error: lastError?.message },
    };
  }
}

export const assistantService = new AssistantService();
