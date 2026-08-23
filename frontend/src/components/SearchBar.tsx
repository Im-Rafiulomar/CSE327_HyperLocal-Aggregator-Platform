import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Mic, Search, X, Upload, Loader2, Sparkles, Square } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { ApiProduct } from "@/lib/api/types";
import { VoiceRecorder } from "@/lib/media/VoiceRecorder";
import { CameraCapture, ImageEncoder } from "@/lib/media/CameraCapture";

export function SearchBar() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<null | "voice" | "visual">(null);

  const go = useCallback(
    (term: string) => {
      setModal(null);
      navigate({ to: "/search", search: { q: term, category: undefined } });
    },
    [navigate],
  );

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex w-full items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 shadow-soft focus-within:ring-2 focus-within:ring-ring"
      >
        <Search className="ml-1 size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => setModal("voice")}
          aria-label={t("voiceSearch")}
          title={t("voiceSearch")}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Mic className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setModal("visual")}
          aria-label={t("visualSearch")}
          title={t("visualSearch")}
          className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary"
        >
          <Camera className="size-4" />
        </button>
        <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          Go
        </button>
      </form>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setModal(null)}>
          <div className="card-surface w-full max-w-md p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">{modal === "voice" ? t("voiceSearch") : t("visualSearch")}</h3>
              <button onClick={() => setModal(null)} aria-label="Close" className="rounded-md p-1 hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
            {modal === "voice" ? (
              <VoicePanel onResult={go} language={lang === "bn" ? "bn-BD" : "en-US"} />
            ) : (
              <VisualPanel onResult={go} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ResultList({ items, onPick }: { items: ApiProduct[]; onPick: (name: string) => void }) {
  if (!items.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{items.length} matching products</p>
      {items.slice(0, 4).map((p) => (
        <button
          key={p._id ?? p.slug}
          onClick={() => onPick(p.name)}
          className="flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left hover:bg-secondary"
        >
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-xl">
            {p.image ? <img src={p.image} alt="" className="size-full object-cover" /> : (p.emoji ?? "📦")}
          </span>
          <span className="flex-1 text-sm">{p.name}</span>
          <span className="text-xs font-semibold text-primary">৳{p.price}</span>
        </button>
      ))}
    </div>
  );
}

/** Real microphone capture: Web Speech API when available, AI transcription otherwise. */
function VoicePanel({ onResult, language }: { onResult: (q: string) => void; language: string }) {
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const [state, setState] = useState<"idle" | "listening" | "working" | "done">("idle");
  const [heard, setHeard] = useState("");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!recorderRef.current) recorderRef.current = new VoiceRecorder();
  const recorder = recorderRef.current;

  useEffect(() => () => recorder.cancel(), [recorder]);

  async function start() {
    setError(null);
    setHeard("");
    setItems([]);
    try {
      await recorder.start(language, setHeard);
      setState("listening");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone unavailable");
    }
  }

  async function stop() {
    setState("working");
    try {
      const capture = await recorder.stop();
      const res = await api.ai.voiceSearch({
        ...(capture.transcript ? { transcript: capture.transcript } : {}),
        ...(capture.audio ? { audio: capture.audio, mimeType: capture.mimeType } : {}),
        language: capture.language,
      });
      setHeard(res.transcript || capture.transcript || "");
      setItems(res.items ?? []);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice search failed");
      setState(heard ? "done" : "idle");
    }
  }

  if (!recorder.supported) {
    return <p className="py-6 text-center text-sm text-muted-foreground">This browser does not support microphone capture.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <button
        onClick={state === "listening" ? stop : start}
        disabled={state === "working"}
        className={
          "flex size-20 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground shadow-lift disabled:opacity-60 " +
          (state === "listening" ? "animate-pulse" : "")
        }
        aria-label={state === "listening" ? "Stop recording" : "Start recording"}
      >
        {state === "working" ? <Loader2 className="size-8 animate-spin" /> : state === "listening" ? <Square className="size-7" /> : <Mic className="size-8" />}
      </button>
      <p className="text-sm text-muted-foreground">
        {state === "idle" && "Tap the mic and speak in Bangla or English"}
        {state === "listening" && "Listening… tap again to search"}
        {state === "working" && "Transcribing with AI…"}
        {state === "done" && "Heard:"}
      </p>
      {heard && <p className="text-base font-medium">“{heard}”</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ResultList items={items} onPick={onResult} />
      {state === "done" && heard && (
        <button
          onClick={() => onResult(heard)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Search “{heard.slice(0, 28)}”
        </button>
      )}
    </div>
  );
}

/** Real camera / photo capture sent to the backend vision model. */
function VisualPanel({ onResult }: { onResult: (q: string) => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<CameraCapture | null>(null);
  const encoderRef = useRef(new ImageEncoder());
  const [mode, setMode] = useState<"idle" | "camera" | "analysing" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!cameraRef.current) cameraRef.current = new CameraCapture(encoderRef.current);
  const camera = cameraRef.current;

  useEffect(() => () => camera.stop(), [camera]);

  async function openCamera() {
    setError(null);
    setMode("camera");
    try {
      // wait a tick so the <video> element is mounted
      await new Promise((r) => requestAnimationFrame(r));
      if (videoRef.current) await camera.start(videoRef.current);
    } catch {
      setError("Camera permission denied — upload a photo instead.");
      setMode("idle");
    }
  }

  async function analyse(dataUrl: string) {
    setPreview(dataUrl);
    setMode("analysing");
    setError(null);
    try {
      const res = await api.ai.imageSearch({ image: dataUrl, limit: 8 });
      setLabels(res.labels ?? []);
      setDescription(res.description ?? "");
      setItems(res.items ?? []);
      if (res.warning) setError(res.warning);
      setMode("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image search failed");
      setMode("done");
    }
  }

  async function shoot() {
    if (!videoRef.current) return;
    const shot = await camera.capture(videoRef.current);
    camera.stop();
    void analyse(shot);
  }

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-8 text-center hover:bg-secondary">
            <Upload className="size-6 text-primary" />
            <span className="text-sm font-medium">Upload a product photo</span>
            <span className="text-xs text-muted-foreground">JPG, PNG or WebP</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) void analyse(await encoderRef.current.fromFile(f));
              }}
            />
          </label>
          {CameraCapture.supported && (
            <button
              onClick={openCamera}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-secondary"
            >
              <Camera className="size-4" /> Use camera
            </button>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </>
      )}

      {mode === "camera" && (
        <div className="space-y-3">
          <video ref={videoRef} playsInline muted className="h-56 w-full rounded-xl bg-secondary object-cover" />
          <button
            onClick={shoot}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Capture &amp; identify
          </button>
        </div>
      )}

      {(mode === "analysing" || mode === "done") && (
        <div className="space-y-3">
          <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-secondary">
            {preview ? <img src={preview} alt="Captured item" className="h-full w-full object-cover" /> : <span className="text-4xl">📷</span>}
          </div>

          {mode === "analysing" ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> AI is identifying the product…
            </div>
          ) : (
            <div className="space-y-3">
              {description && (
                <p className="flex gap-2 rounded-lg bg-secondary/60 p-2 text-xs text-muted-foreground">
                  <Sparkles className="size-3.5 shrink-0 text-primary" /> {description}
                </p>
              )}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => (
                    <button
                      key={l}
                      onClick={() => onResult(l)}
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-secondary"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              <ResultList items={items} onPick={onResult} />
              {error && <p className="text-xs text-destructive">{error}</p>}
              {!items.length && !error && <p className="text-sm text-muted-foreground">No matching listings found.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
