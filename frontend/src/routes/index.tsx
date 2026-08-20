import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Sparkles, Camera, Mic, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HyperLocal — Compare Local & Online Sellers in One Marketplace" },
      { name: "description", content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations." },
      { property: "og:title", content: "HyperLocal — Compare Local & Online Sellers in One Marketplace" },
      { property: "og:description", content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations." },
    ],
  }),
  component: Index,
});

function Index() {
  const { lang, t } = useLang();
  const { viewed, wishlist } = useStore();

  const recos = [
    { p: products.find((x) => x.id === "p6")!, why: lang === "bn" ? "আপনার উইশলিস্টের সাথে মিল" : "Matches your wishlist in beauty" },
    { p: products.find((x) => x.id === "p2")!, why: lang === "bn" ? "আপনি হেডফোন দেখেছেন" : "Because you viewed headphones" },
    { p: products.find((x) => x.id === "p3")!, why: lang === "bn" ? "আপনি প্রতি মাসে অর্ডার করেন" : "You reorder this roughly monthly" },
    { p: products.find((x) => x.id === "p4")!, why: lang === "bn" ? "ঈদ মৌসুমের ট্রেন্ড" : "Seasonal trend: Eid collection" },
  ];

  return (
    <Layout>
      <section className="overflow-hidden rounded-3xl bg-hero-gradient p-8 text-primary-foreground shadow-lift md:p-12">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold">
          <Sparkles className="size-3.5" /> AI-powered · Bangla & English
        </span>
        <h1 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-5xl">
          {lang === "bn" ? "পাড়ার দোকান আর অনলাইন সেলার — এক জায়গায়" : "Every shop near you, and every online seller, in one place"}
        </h1>
        <p className="mt-3 max-w-xl text-sm opacity-90 md:text-base">{t("tagline")}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/search" search={{ q: "", category: undefined }} className="rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-bold text-accent-foreground">
            {lang === "bn" ? "কেনাকাটা শুরু করুন" : "Start shopping"}
          </Link>
          <Link to="/seller" className="rounded-xl border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold">
            {lang === "bn" ? "বিক্রেতা ড্যাশবোর্ড" : "Seller dashboard"}
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: Camera, label: t("visualSearch"), sub: "Upload a photo, find the item" },
            { icon: Mic, label: t("voiceSearch"), sub: "Speak in Bangla or English" },
            { icon: ShieldCheck, label: "Fake review detection", sub: "Ratings you can trust" },
          ].map((f) => (
            <div key={f.label} className="rounded-2xl bg-primary-foreground/10 p-4">
              <f.icon className="size-5" />
              <p className="mt-2 text-sm font-semibold">{f.label}</p>
              <p className="text-xs opacity-80">{f.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">{t("categories")}</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/search"
              search={{ q: "", category: c.id }}
              className="card-surface flex flex-col items-center gap-1 p-4 text-center transition-transform hover:-translate-y-1"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold">{lang === "bn" ? c.nameBn : c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">{t("recommended")}</h2>
            <p className="text-xs text-muted-foreground">
              {lang === "bn"
                ? "ব্রাউজিং, উইশলিস্ট, বাজেট ও মৌসুমি ট্রেন্ড থেকে তৈরি"
                : `Built from ${viewed.length} recently viewed items, ${wishlist.length} wishlist saves, your budget band and seasonal trends`}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recos.map(({ p, why }) => (
            <ProductCard key={p.id} product={p} reason={why} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <Zap className="size-5 text-accent" /> {t("trending")}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card-surface p-6">
          <h3 className="font-display text-lg font-bold">{lang === "bn" ? "সব ফিচার দেখুন" : "Every feature in this prototype"}</h3>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {[
              "AI shopping assistant",
              "Personalised recommendations",
              "Visual search",
              "Voice search",
              "Review summary + fake detection",
              "Multiple payment methods",
              "Live order tracking",
              "Cart & wishlist",
              "Product details & seller compare",
              "Search, filters & categories",
              "User & seller profiles",
              "Rewards, coins & coupons",
              "Push notifications",
              "Bangla / English switch",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-primary" /> {f}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-surface flex flex-col justify-center gap-3 bg-secondary/60 p-6">
          <h3 className="font-display text-lg font-bold">{lang === "bn" ? "স্থানীয় বিক্রেতাদের সাপোর্ট করুন" : "Backing local businesses"}</h3>
          <p className="text-sm text-muted-foreground">
            Local shops appear beside national retailers with same-day delivery, verified badges and transparent price comparison —
            so neighbourhood sellers compete on service, not just ad budget.
          </p>
          <div className="flex gap-4 text-center">
            {[["1,240", "local sellers"], ["18.4k", "listings"], ["96%", "on-time delivery"]].map(([v, l]) => (
              <div key={l} className="flex-1 rounded-xl bg-card p-3">
                <div className="font-display text-xl font-bold text-primary">{v}</div>
                <div className="text-[11px] text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
