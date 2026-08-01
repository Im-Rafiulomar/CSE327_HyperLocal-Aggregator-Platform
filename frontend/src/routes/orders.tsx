import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { getProduct, getSeller, trackingSteps } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Check, Package, Truck, Home, ClipboardCheck } from "lucide-react";

const icons = [ClipboardCheck, Package, Truck, Home];

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order tracking — HyperLocal" },
      { name: "description", content: "Track every order in real time from confirmation to delivery, with seller and payment details." },
      { property: "og:title", content: "Order tracking — HyperLocal" },
      { property: "og:description", content: "Live delivery status for all your multi-vendor orders." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { lang, t } = useLang();
  const { orders } = useStore();
  const [open, setOpen] = useState<string | null>(orders[0]?.id ?? null);

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">{t("orders")}</h1>
      <div className="mt-4 space-y-3">
        {orders.map((o) => {
          const s = getSeller(o.seller);
          const expanded = open === o.id;
          return (
            <div key={o.id} className="card-surface overflow-hidden">
              <button onClick={() => setOpen(expanded ? null : o.id)} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-xl">📦</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">#{o.id}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {o.date} · {lang === "bn" ? s.nameBn : s.name} · {o.payment}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold">{money(o.total, lang)}</p>
                  <p className="text-[11px] text-primary">{lang === "bn" ? trackingSteps[o.status]!.bn : trackingSteps[o.status]!.en}</p>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-border p-4">
                  <div className="flex items-center">
                    {trackingSteps.map((step, i) => {
                      const done = i <= o.status;
                      const Icon = icons[i]!;
                      return (
                        <div key={step.key} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={
                                "flex size-9 items-center justify-center rounded-full border-2 " +
                                (done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground")
                              }
                            >
                              {done && i < o.status ? <Check className="size-4" /> : <Icon className="size-4" />}
                            </span>
                            <span className={"w-20 text-center text-[10px] " + (done ? "font-semibold" : "text-muted-foreground")}>
                              {lang === "bn" ? step.bn : step.en}
                            </span>
                          </div>
                          {i < trackingSteps.length - 1 && (
                            <div className={"mb-5 h-0.5 flex-1 " + (i < o.status ? "bg-primary" : "bg-border")} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl bg-secondary p-3 text-xs">
                    <p className="font-semibold">Live update</p>
                    <p className="text-muted-foreground">
                      {o.status >= 3
                        ? "Delivered and signed for. Rate the seller to earn 20 coins."
                        : "Rider Shakil is 2.4 km away · estimated arrival 5:40 PM · +880 1911 223344"}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2">
                    {o.items.map((it) => {
                      const p = getProduct(it.productId)!;
                      return (
                        <Link
                          key={it.productId}
                          to="/product/$productId"
                          params={{ productId: p.id }}
                          className="flex items-center gap-3 rounded-lg border border-border p-2 hover:bg-secondary"
                        >
                          <span className="flex size-10 items-center justify-center rounded-md text-lg" style={{ backgroundImage: p.image }}>
                            {p.emoji}
                          </span>
                          <span className="flex-1 text-sm">{lang === "bn" ? p.nameBn : p.name}</span>
                          <span className="text-xs text-muted-foreground">×{it.qty}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
