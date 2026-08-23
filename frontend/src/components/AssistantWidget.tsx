import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Send, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";

type Msg = { role: "user" | "assistant"; text: string; chips?: { label: string; to: string; params?: Record<string, string> }[] };

const suggestions = [
  "Compare the two cheapest headphone offers",
  "Where is my latest order?",
  "Suggest a gift under ৳2000",
  "Are the reviews on the serum trustworthy?",
];

export function AssistantWidget() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Salam! I'm your HyperLocal assistant. Ask me to compare sellers, track an order, or find something within your budget." },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    api.ai
      .assistant(text)
      .then((res) => {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text: res.reply || "No response from assistant.",
            chips: [{ label: "Browse products", to: "/search" }],
          },
        ]);
      })
      .catch((err) => {
        setMsgs((m) => [
          ...m,
          {
            role: "assistant",
            text:
              err instanceof Error
                ? err.message
                : "Assistant is unavailable right now.",
          },
        ]);
      })
      .finally(() => setTyping(false));
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-hero-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:scale-105"
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
        <span className="hidden sm:inline">{t("assistant")}</span>
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-130 w-[min(92vw,380px)] flex-col overflow-hidden card-surface shadow-lift">
          <div className="flex items-center gap-2 bg-hero-gradient px-4 py-3 text-primary-foreground">
            <Bot className="size-5" />
            <div>
              <div className="text-sm font-semibold">{t("assistant")}</div>
              <div className="text-[11px] opacity-80">Live backend assistant</div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                      : "max-w-[92%] text-sm leading-relaxed text-foreground"
                  }
                >
                  {m.text}
                  {m.chips && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <Link
                          key={c.label}
                          to={c.to}
                          params={c.params as never}
                          onClick={() => setOpen(false)}
                          className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && <div className="animate-pulse text-sm text-muted-foreground">Thinking…</div>}
            <div ref={endRef} />
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-border px-3 pt-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="rounded-lg bg-primary p-2 text-primary-foreground" aria-label="Send">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
