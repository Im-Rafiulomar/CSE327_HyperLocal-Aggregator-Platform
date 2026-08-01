import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bot, Send, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { products } from "@/lib/mock-data";
import { useStore } from "@/lib/store";

type Msg = { role: "user" | "assistant"; text: string; chips?: { label: string; to: string; params?: Record<string, string> }[] };

const suggestions = [
  "Compare the two cheapest headphone offers",
  "Where is my order HL-2291?",
  "Suggest a gift under ৳2000",
  "Are the reviews on the serum trustworthy?",
];

function reply(input: string, orders: { id: string; status: number }[]): Msg {
  const q = input.toLowerCase();

  if (q.includes("order") || q.includes("track") || q.includes("hl-")) {
    const o = orders[0];
    return {
      role: "assistant",
      text: o
        ? `Order #${o.id} is currently at stage "${["confirmed", "packed", "out for delivery", "delivered"][o.status]}". Estimated arrival today between 5–8 PM. Want me to open the live tracker?`
        : "You have no active orders right now.",
      chips: [{ label: "Open order tracking", to: "/orders" }],
    };
  }
  if (q.includes("compare") || q.includes("cheapest") || q.includes("price")) {
    const p = products[0]!;
    const sorted = [...p.offers].sort((a, b) => a.price - b.price);
    return {
      role: "assistant",
      text: `For ${p.name}: TechHub BD Online is ৳${sorted[0]!.price} (2–3 days nationwide) while Dhanmondi Electronics is ৳${sorted[1]!.price} but delivers the same day locally. If you need it today, the ৳151 premium is worth it; otherwise take the online seller.`,
      chips: [{ label: "See full comparison", to: "/product/$productId", params: { productId: p.id } }],
    };
  }
  if (q.includes("review") || q.includes("fake") || q.includes("trust")) {
    return {
      role: "assistant",
      text: "I scanned 452 reviews for the Vitamin C serum. 1 review is flagged as suspicious (promotional account, only 5-star posts). Excluding flagged reviews the rating drops from 4.4 to 4.3. Genuine buyers report visible results in 4–8 weeks with mild tingling on sensitive skin.",
      chips: [{ label: "Read the summary", to: "/product/$productId", params: { productId: "p6" } }],
    };
  }
  if (q.includes("gift") || q.includes("under") || q.includes("budget") || q.includes("suggest") || q.includes("recommend")) {
    return {
      role: "assistant",
      text: "Under ৳2,000 I'd pick the Handloom Cotton Panjabi (৳1,750, local artisan, 4.5★) for a gift, or the Tape Ball Cricket Bat (৳1,450) if they play street cricket. Both ship same/next day inside Dhaka.",
      chips: [
        { label: "Handloom Panjabi", to: "/product/$productId", params: { productId: "p4" } },
        { label: "Cricket Bat", to: "/product/$productId", params: { productId: "p7" } },
      ],
    };
  }
  const match = products.find((p) => q.includes(p.name.toLowerCase().split(" ")[0]!.toLowerCase()));
  if (match) {
    return {
      role: "assistant",
      text: `${match.name} is ৳${match.price} from ${match.offers.length} sellers, rated ${match.rating}★. Summary: ${match.aiSummary}`,
      chips: [{ label: "Open product", to: "/product/$productId", params: { productId: match.id } }],
    };
  }
  return {
    role: "assistant",
    text: "I can compare seller offers, track your orders, summarise reviews, or recommend products within a budget. Try asking about a category like electronics or grocery.",
  };
}

export function AssistantWidget() {
  const { t } = useLang();
  const { orders } = useStore();
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
    window.setTimeout(() => {
      setMsgs((m) => [...m, reply(text, orders)]);
      setTyping(false);
    }, 700);
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
        <div className="fixed bottom-24 right-5 z-50 flex h-[520px] w-[min(92vw,380px)] flex-col overflow-hidden card-surface shadow-lift">
          <div className="flex items-center gap-2 bg-hero-gradient px-4 py-3 text-primary-foreground">
            <Bot className="size-5" />
            <div>
              <div className="text-sm font-semibold">{t("assistant")}</div>
              <div className="text-[11px] opacity-80">Demo responses · no live model</div>
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
