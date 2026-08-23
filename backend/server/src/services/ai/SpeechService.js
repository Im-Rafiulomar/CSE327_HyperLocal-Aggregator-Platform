import { getAiProvider } from "./AiProvider.js";
import { productRepository } from "../../repositories/index.js";
import { badRequest } from "../../utils/errors.js";

const MAX_AUDIO_BYTES = 8 * 1024 * 1024;

/**
 * Speech-to-text for voice search. Accepts a base64 data URL recorded in the
 * browser (MediaRecorder) and returns a transcript plus matching products.
 * The transcript may also be supplied directly by the Web Speech API, in which
 * case no AI call is made — one contract, two inputs (SRP + OCP).
 */
export class SpeechService {
  constructor({ provider = null, products = productRepository } = {}) {
    this._provider = provider;
    this.products = products;
  }

  get provider() {
    return this._provider ?? getAiProvider();
  }

  static decode(dataUrl) {
    const base64 = String(dataUrl).includes(",") ? String(dataUrl).split(",").pop() : String(dataUrl);
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.length) throw badRequest("Empty audio payload");
    if (buffer.length > MAX_AUDIO_BYTES) throw badRequest("Audio clip is too large (max 8 MB)");
    return buffer;
  }

  async transcribe({ audio, mimeType = "audio/webm", language }) {
    if (!this.provider.available) throw badRequest("Voice AI is not configured on the server (set AI_API_KEY)");
    const buffer = SpeechService.decode(audio);
    const text = await this.provider.transcribe({ buffer, mimeType, language });
    if (!text.trim()) throw badRequest("Could not hear anything in that clip");
    return text.trim();
  }

  /** Full voice-search flow: audio (or transcript) -> ranked products. */
  async search({ audio, transcript, mimeType, language, limit = 8 }) {
    const text = transcript?.trim() || (await this.transcribe({ audio, mimeType, language }));
    let items = await this.products.byText(text, limit);
    if (items.length === 0) {
      const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      items = await this.products.byLabels(words.slice(0, 6), limit);
    }
    return { transcript: text, items };
  }
}

export const speechService = new SpeechService();
