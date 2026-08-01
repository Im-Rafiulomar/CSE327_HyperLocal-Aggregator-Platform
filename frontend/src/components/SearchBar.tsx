import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Mic, Search, X, Upload, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { products } from "@/lib/mock-data";

export function SearchBar() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<null | "voice" | "visual">(null);

  const go = (term: string) => {
    setModal(null);
    navigate({ to: "/search", search: { q: term, category: undefined } });
  };

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
          {t("home") && "Go"}
        </button>
      </form>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md card-surface p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">
                {modal === "voice" ? t("voiceSearch") : t("visualSearch")}
              </h3>
              <button onClick={() => setModal(null)} aria-label="Close" className="rounded-md p-1 hover:bg-secondary">
                <X className="size-4" />
              </button>
            </div>
            {modal === "voice" ? <VoicePanel onResult={go} /> : <VisualPanel onResult={go} />}
          </div>
        </div>
      )}
    </>
  );
}

function VoicePanel({ onResult }: { onResult: (q: string) => void }) {
  const [state, setState] = useState<"idle" | "listening" | "done">("idle");
  const [heard, setHeard] = useState("");
  const phrases = ["wireless headphones under 7000 taka", "বাসমতি চাল ৫ কেজি", "vitamin c serum"];

  const listen = () => {
    setState("listening");
    const phrase = phrases[Math.floor(Math.random() * phrases.length)]!;
    let i = 0;
    const int = window.setInterval(() => {
      i += 2;
      setHeard(phrase.slice(0, i));
      if (i >= phrase.length) {
        window.clearInterval(int);
        setState("done");
      }
    }, 60);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <button
        onClick={listen}
        className={
          "flex size-20 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground shadow-lift " +
          (state === "listening" ? "animate-pulse" : "")
        }
      >
        <Mic className="size-8" />
      </button>
      <p className="text-sm text-muted-foreground">
        {state === "idle" && "Tap the mic and speak in Bangla or English"}
        {state === "listening" && "Listening…"}
        {state === "done" && "Heard:"}
      </p>
      {heard && <p className="text-base font-medium">“{heard}”</p>}
      {state === "done" && (
        <button onClick={() => onResult(heard)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Search this
        </button>
      )}
      <p className="text-[11px] text-muted-foreground">Prototype: speech recognition is simulated.</p>
    </div>
  );
}

function VisualPanel({ onResult }: { onResult: (q: string) => void }) {
  const [state, setState] = useState<"idle" | "analysing" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);

  const run = (dataUrl: string | null) => {
    setPreview(dataUrl);
    setState("analysing");
    window.setTimeout(() => setState("done"), 1400);
  };

  const matches = products.slice(0, 3);

  return (
    <div className="space-y-4">
      {state === "idle" && (
        <>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-8 text-center hover:bg-secondary">
            <Upload className="size-6 text-primary" />
            <span className="text-sm font-medium">Upload a product photo</span>
            <span className="text-xs text-muted-foreground">JPG or PNG, up to 5 MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                run(f ? URL.createObjectURL(f) : null);
              }}
            />
          </label>
          <button
            onClick={() => run(null)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-secondary"
          >
            <Camera className="size-4" /> Use camera (demo)
          </button>
        </>
      )}

      {state !== "idle" && (
        <div className="space-y-3">
          <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-secondary">
            {preview ? (
              <img src={preview} alt="Uploaded item" className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl">📷</span>
            )}
          </div>
          {state === "analysing" ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Matching against 18,400 local listings…
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium">3 visually similar items found</p>
              {matches.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onResult(p.name)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left hover:bg-secondary"
                >
                  <span className="flex size-10 items-center justify-center rounded-md text-xl" style={{ backgroundImage: p.image }}>
                    {p.emoji}
                  </span>
                  <span className="flex-1 text-sm">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{90 - matches.indexOf(p) * 12}% match</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground">Prototype: image matching is simulated.</p>
    </div>
  );
}
