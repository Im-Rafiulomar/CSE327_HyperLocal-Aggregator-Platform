/**
 * Microphone capture (class-based, framework agnostic).
 *
 * Two cooperating strategies:
 *  - `SpeechRecognitionStrategy` uses the browser's on-device Web Speech API
 *    (instant, free, works for bn-BD and en-US).
 *  - `MediaRecorderStrategy` records real audio and hands the base64 blob to
 *    the backend AI transcription model.
 *
 * `VoiceRecorder` is the facade the UI talks to; it picks whichever strategy
 * is available, so components never touch browser APIs directly (DIP).
 */

export type VoiceCapture = { transcript?: string; audio?: string; mimeType?: string; language: string };

export interface VoiceStrategy {
  readonly name: "speech-api" | "recorder";
  isSupported(): boolean;
  start(language: string, onPartial?: (text: string) => void): Promise<void>;
  stop(): Promise<VoiceCapture>;
  cancel(): void;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as (new () => SpeechRecognitionLike) | null;
}

export class SpeechRecognitionStrategy implements VoiceStrategy {
  readonly name = "speech-api" as const;
  private recognition: SpeechRecognitionLike | null = null;
  private transcript = "";
  private language = "en-US";
  private ended: Promise<void> = Promise.resolve();

  isSupported() {
    return Boolean(getSpeechRecognitionCtor());
  }

  async start(language: string, onPartial?: (text: string) => void) {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) throw new Error("Speech recognition is not supported in this browser");

    this.language = language;
    this.transcript = "";
    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    this.ended = new Promise<void>((resolve) => {
      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i += 1) text += event.results[i]?.[0]?.transcript ?? "";
        this.transcript = text.trim();
        onPartial?.(this.transcript);
      };
      recognition.onerror = () => resolve();
      recognition.onend = () => resolve();
    });

    recognition.start();
    this.recognition = recognition;
  }

  async stop(): Promise<VoiceCapture> {
    this.recognition?.stop();
    await Promise.race([this.ended, new Promise((r) => setTimeout(r, 1200))]);
    this.recognition = null;
    return { transcript: this.transcript, language: this.language };
  }

  cancel() {
    this.recognition?.abort();
    this.recognition = null;
  }
}

export class MediaRecorderStrategy implements VoiceStrategy {
  readonly name = "recorder" as const;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private language = "en-US";

  isSupported() {
    return typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices);
  }

  async start(language: string) {
    this.language = language;
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.recorder.ondataavailable = (e) => e.data.size > 0 && this.chunks.push(e.data);
    this.recorder.start();
  }

  async stop(): Promise<VoiceCapture> {
    const recorder = this.recorder;
    if (!recorder) return { language: this.language };

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" }));
      recorder.stop();
    });
    this.release();

    return { audio: await blobToDataUrl(blob), mimeType: blob.type, language: this.language };
  }

  cancel() {
    try {
      this.recorder?.stop();
    } catch {
      /* already stopped */
    }
    this.release();
  }

  private release() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the recording"));
    reader.readAsDataURL(blob);
  });
}

/** Facade the UI uses. */
export class VoiceRecorder {
  private active: VoiceStrategy | null = null;

  constructor(private readonly strategies: VoiceStrategy[] = [new SpeechRecognitionStrategy(), new MediaRecorderStrategy()]) {}

  get supported() {
    return this.strategies.some((s) => s.isSupported());
  }

  get mode() {
    return this.active?.name ?? null;
  }

  async start(language: string, onPartial?: (text: string) => void) {
    const strategy = this.strategies.find((s) => s.isSupported());
    if (!strategy) throw new Error("Microphone capture is not supported in this browser");
    this.active = strategy;
    await strategy.start(language, onPartial);
  }

  async stop() {
    const strategy = this.active;
    this.active = null;
    return strategy ? strategy.stop() : ({ language: "en-US" } as VoiceCapture);
  }

  cancel() {
    this.active?.cancel();
    this.active = null;
  }
}
