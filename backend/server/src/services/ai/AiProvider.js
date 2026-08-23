/**
 * AI provider abstraction (SOLID: DIP + LSP).
 *
 * Domain services (assistant, vision, speech) depend on this interface, never
 * on a concrete vendor SDK. Swapping OpenAI for another gateway means adding a
 * subclass — no service code changes (OCP).
 */
export class AiProvider {
  get available() {
    return false;
  }

  // eslint-disable-next-line no-unused-vars
  async chat(_messages, _options) {
    throw new Error("AiProvider.chat() must be implemented");
  }

  // eslint-disable-next-line no-unused-vars
  async transcribe(_audio) {
    throw new Error("AiProvider.transcribe() must be implemented");
  }
}

/** Null Object: keeps callers branch-free when no API key is configured. */
export class NullAiProvider extends AiProvider {
  get available() {
    return false;
  }

  async chat() {
    throw new Error("AI provider is not configured (set AI_API_KEY)");
  }

  async transcribe() {
    throw new Error("AI provider is not configured (set AI_API_KEY)");
  }
}

/**
 * Works with any OpenAI-compatible endpoint: OpenAI, Groq, OpenRouter,
 * Lovable AI Gateway, a local Ollama/LM Studio server, ...
 */
export class OpenAiCompatibleProvider extends AiProvider {
  constructor({ apiKey, baseUrl, model, visionModel, transcribeModel, keyHeader }) {
    super();
    this.apiKey = apiKey;
    this.baseUrl = (baseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    this.model = model || "gpt-4o-mini";
    this.visionModel = visionModel || this.model;
    this.transcribeModel = transcribeModel || "whisper-1";
    this.keyHeader = keyHeader || "Authorization";
  }

  get available() {
    return Boolean(this.apiKey);
  }

  get authHeaders() {
    return this.keyHeader.toLowerCase() === "authorization"
      ? { Authorization: `Bearer ${this.apiKey}` }
      : { [this.keyHeader]: this.apiKey };
  }

  async chat(messages, { model, temperature = 0.3, json = false, maxTokens = 700 } = {}) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.authHeaders },
      body: JSON.stringify({
        model: model || this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`AI chat failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    return body.choices?.[0]?.message?.content ?? "";
  }

  /** Multimodal call: an image plus an instruction, using the vision model. */
  async describeImage(dataUrl, instruction) {
    return this.chat(
      [
        {
          role: "user",
          content: [
            { type: "text", text: instruction },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      { model: this.visionModel, json: true, temperature: 0.1 },
    );
  }

  async transcribe({ buffer, mimeType = "audio/webm", language }) {
    const form = new FormData();
    form.append("file", new Blob([buffer], { type: mimeType }), "audio.webm");
    form.append("model", this.transcribeModel);
    if (language) form.append("language", language);

    const res = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: this.authHeaders,
      body: form,
    });
    if (!res.ok) throw new Error(`Transcription failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    return body.text ?? "";
  }
}

/**
 * Factory + lazy Singleton. Environment variables are read on first use so the
 * process can boot before dotenv finishes (and so tests can swap the instance).
 */
export class AiProviderFactory {
  static instance = null;

  static create(env = process.env) {
    if (!env.AI_API_KEY) return new NullAiProvider();
    return new OpenAiCompatibleProvider({
      apiKey: env.AI_API_KEY,
      baseUrl: env.AI_BASE_URL,
      model: env.AI_MODEL,
      visionModel: env.AI_VISION_MODEL,
      transcribeModel: env.AI_TRANSCRIBE_MODEL,
      keyHeader: env.AI_KEY_HEADER,
    });
  }

  static get() {
    if (!AiProviderFactory.instance) AiProviderFactory.instance = AiProviderFactory.create();
    return AiProviderFactory.instance;
  }

  /** Test seam / runtime override. */
  static set(provider) {
    AiProviderFactory.instance = provider;
  }
}

export const getAiProvider = () => AiProviderFactory.get();
