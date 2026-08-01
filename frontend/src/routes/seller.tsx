import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { products, sellers } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { Sparkles, Star, ShieldCheck, TrendingUp, Package, Clock } from "lucide-react";

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "Seller dashboard — HyperLocal" },
      { name: "description", content: "Storefront profile, listings, sales performance and AI decision support for local vendors." },
      { property: "og:title", content: "Seller dashboard — HyperLocal" },
      { property: "og:description", content: "AI insights that help local sellers price, stock and grow." },
    ],
  }),
  component: SellerPage,
});

const salesBars = [42, 55, 38, 70, 64, 88, 76];

function SellerPage() {
  const { lang } = useLang();
  const seller = sellers[0]!;
  const listings = products.filter((p) => p.offers.some((o) => o.sellerId === seller.id));

  return (
    <Layout>
      <div className="card-surface flex flex-wrap items-center gap-4 p-6">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-gradient text-2xl text-accent-foreground">🏪</span>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            {lang === "bn" ? seller.nameBn : seller.name}
            {seller.verified && <ShieldCheck className="size-5 text-success" />}
          </h1>
          <p className="text-sm text-muted-foreground">
            {seller.area} · since {seller.since} · replies in {seller.responseTime}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" /> {seller.rating} · {listings.length} active listings
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Sales this week", value: money(184500, lang) },
          { icon: Package, label: "Orders", value: "63" },
          { icon: Clock, label: "On-time delivery", value: "96%" },
          { icon: Star, label: "Rating trend", value: "+0.2" },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4">
            <s.icon className="size-5 text-primary" />
            <div className="mt-2 font-display text-xl font-bold">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="card-surface p-5">
          <h2 className="font-display font-bold">Last 7 days</h2>
          <div className="mt-4 flex h-40 items-end gap-2">
            {salesBars.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t-lg bg-hero-gradient" style={{ height: `${v}%` }} />
                <span className="text-[10px] text-muted-foreground">{["S", "M", "T", "W", "T", "F", "S"][i]}</span>
              </div>
            ))}
          </div>

          <h3 className="mt-6 font-display font-bold">Your listings</h3>
          <div className="mt-2 divide-y divide-border">
            {listings.map((p) => {
              const o = p.offers.find((x) => x.sellerId === seller.id)!;
              const cheapest = Math.min(...p.offers.map((x) => x.price));
              return (
                <div key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex size-10 items-center justify-center rounded-lg text-lg" style={{ backgroundImage: p.image }}>
                    {p.emoji}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lang === "bn" ? p.nameBn : p.name}</p>
                    <p className="text-[11px] text-muted-foreground">{o.stock} in stock</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{money(o.price, lang)}</p>
                    {o.price > cheapest && (
                      <p className="text-[11px] text-destructive">{money(o.price - cheapest, lang)} above lowest</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="card-surface h-fit space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <Sparkles className="size-4 text-primary" /> AI decision support
          </h2>
          {[
            { tag: "Pricing", text: "Your headphone listing is ৳151 above the lowest offer. Dropping to ৳6,349 would win an estimated 28% more local orders." },
            { tag: "Stock", text: "Basmati rice sells 22 units/week here. Current stock covers 6 days — restock before Thursday." },
            { tag: "Visibility", text: "Adding 3 more photos and a Bangla description raises listing views by ~34% on average." },
            { tag: "Timing", text: "Your buyers order most between 7–10 PM. Schedule flash offers in that window." },
          ].map((i) => (
            <div key={i.tag} className="rounded-xl bg-secondary p-3">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{i.tag}</span>
              <p className="text-sm leading-snug">{i.text}</p>
            </div>
          ))}
        </aside>
      </div>
    </Layout>
  );
}
