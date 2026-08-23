import { TextSearchStrategy, VoiceSearchStrategy, VisualSearchStrategy } from "./strategies.js";
import { badRequest } from "../../utils/errors.js";

/**
 * Factory + Context for the search strategies.
 * Callers ask for a mode; they never construct strategies themselves.
 */
export class SearchService {
  constructor(strategies) {
    this.strategies =
      strategies ??
      new Map([
        ["text", new TextSearchStrategy()],
        ["voice", new VoiceSearchStrategy()],
        ["visual", new VisualSearchStrategy()],
      ]);
  }

  register(mode, strategy) {
    this.strategies.set(mode, strategy);
    return this;
  }

  search(mode, input) {
    const strategy = this.strategies.get(mode);
    if (!strategy) throw badRequest(`Unknown search mode: ${mode}`);
    return strategy.execute(input);
  }
}

export const searchService = new SearchService();
