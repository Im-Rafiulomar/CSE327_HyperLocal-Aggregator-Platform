import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getSeller, products } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Star, Heart, ShieldCheck, MapPin, Truck, AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/product/$productId")({
  head: ({ params }) => {
    const p = getProduct(params.productId);
    const title = p ? `${p.name} — compare ${p.offers.length} sellers | HyperLocal` : "Product — HyperLocal";
    const desc = p ? p.description.slice(0, 150) : "Product details, seller comparison and AI review summary.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { productId: product.id };
  },
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const product = getProduct(productId)!;
  const { lang, t } = useLang();
  const { addToCart, wishlist, toggleWishlist, markViewed } = useStore();
  const sorted = [...product.offers].sort((a, b) => a.price - b.price);
  const [sellerId, setSellerId] = useState(sorted[0]!.sellerId);
  const [tab, setTab] = useState<"summary" | "all">("summary");
  const [showFlagged, setShowFlagged] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    markViewed(productId);
    setSellerId(sorted[0]!.sellerId);
  }, [productId]);

  const offer = product.offers.find((o) => o.sellerId === sellerId)!;
  const genuine = product.reviews.filter((r) => !r.suspicious);
  const flagged = product.reviews.filter((r) => r.suspicious);
  const genuineAvg = (genuine.reduce((s, r) => s + r.rating, 0) / genuine.length).toFixed(1);

  return (
    <Layout>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex h-80 items-center justify-center rounded-3xl text-8xl shadow-soft" style={{ backgroundImage: product.image }}>
            {product.emoji}
          </div>
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-16 flex-1 items-center justify-center rounded-xl text-2xl opacity-70" style={{ backgroundImage: product.image }}>
                {product.emoji}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{product.brand}</p>
          <h1 className="mt-1 font-display text-2xl font-bold md:text-3xl">{lang === "bn" ? product.nameBn : product.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" /> {product.rating} ({product.reviewCount} {t("reviews")})
            </span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {product.offers.length} sellers
            </span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {lang === "bn" ? product.descriptionBn : product.description}
          </p>

          <div className="mt-5">
            <h2 className="mb-2 font-display font-bold">{t("compareSellers")}</h2>
            <div className="space-y-2">
              {sorted.map((o, i) => {
                const s = getSeller(o.sellerId);
                const active = o.sellerId === sellerId;
                return (
                  <button
                    key={o.sellerId}
                    onClick={() => setSellerId(o.sellerId)}
                    className={
                      "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors " +
                      (active ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60")
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 text-sm font-semibold">
                        {lang === "bn" ? s.nameBn : s.name}
                        {s.verified && <ShieldCheck className="size-3.5 text-success" />}
                        {i === 0 && (
                          <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">BEST PRICE</span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="size-3" />{s.area}</span>
                        <span className="flex items-center gap-1"><Truck className="size-3" />{o.delivery}</span>
                        <span className="flex items-center gap-1"><Star className="size-3 fill-accent text-accent" />{s.rating}</span>
                        <span>{o.stock} in stock</span>
                      </div>
                    </div>
                    <div className="font-display text-lg font-bold">{money(o.price, lang)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div>
              <div className="font-display text-3xl font-extrabold">{money(offer.price, lang)}</div>
              {product.oldPrice && <div className="text-sm text-muted-foreground line-through">{money(product.oldPrice, lang)}</div>}
            </div>
            <button
              onClick={() => {
                addToCart(product.id, sellerId);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1800);
              }}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {added ? "✓ Added" : t("addToCart")}
            </button>
            <Link
              to="/checkout"
              onClick={() => addToCart(product.id, sellerId)}
              className="rounded-xl bg-accent-gradient px-5 py-3 text-sm font-bold text-accent-foreground"
            >
              {t("buyNow")}
            </Link>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="rounded-xl border border-border p-3 hover:bg-secondary"
              aria-label={t("wishlist")}
            >
              <Heart className={"size-5 " + (wishlist.includes(product.id) ? "fill-destructive text-destructive" : "")} />
            </button>
          </div>

          <div className="mt-6">
            <h2 className="mb-2 font-display font-bold">{t("specs")}</h2>
            <dl className="card-surface divide-y divide-border text-sm">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => setTab("summary")}
            className={"rounded-lg px-3 py-1.5 text-sm font-semibold " + (tab === "summary" ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
          >
            {t("aiSummary")}
          </button>
          <button
            onClick={() => setTab("all")}
            className={"rounded-lg px-3 py-1.5 text-sm font-semibold " + (tab === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary")}
          >
            {t("reviews")} ({product.reviews.length})
          </button>
        </div>

        {tab === "summary" ? (
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <div className="card-surface p-5">
              <h3 className="flex items-center gap-2 font-display font-bold">
                <Sparkles className="size-4 text-primary" /> {t("aiSummary")}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.aiSummary}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Most praised</p>
                  <p className="text-sm">Battery life · value for money · delivery speed</p>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Most criticised</p>
                  <p className="text-sm">Long-session comfort · mic quality</p>
                </div>
              </div>
            </div>
            <div className="card-surface p-5">
              <h3 className="flex items-center gap-2 font-display font-bold">
                <AlertTriangle className="size-4 text-destructive" /> Fake review detection
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {flagged.length} of {product.reviews.length} shown reviews flagged as suspicious.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div>
                  <div className="font-display text-2xl font-bold">{product.rating}</div>
                  <div className="text-[11px] text-muted-foreground">listed rating</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-success">{genuineAvg}</div>
                  <div className="text-[11px] text-muted-foreground">verified-only rating</div>
                </div>
              </div>
              <button onClick={() => { setTab("all"); setShowFlagged(true); }} className="mt-3 text-xs font-semibold text-primary underline">
                Show flagged reviews
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showFlagged} onChange={(e) => setShowFlagged(e.target.checked)} className="accent-[var(--primary)]" />
              Include flagged reviews
            </label>
            {product.reviews
              .filter((r) => showFlagged || !r.suspicious)
              .map((r) => (
                <div key={r.id + r.user} className={"card-surface p-4 " + (r.suspicious ? "border-destructive/50" : "")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                        {r.user.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{r.user}</p>
                        <p className="text-[11px] text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {r.rating}
                      <Star className="size-3.5 fill-accent text-accent" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm">{r.text}</p>
                  {r.suspicious ? (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      <span>
                        <strong>{t("flagged")}:</strong> {r.reason}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1 text-xs text-success">
                      <CheckCircle2 className="size-3.5" /> Verified purchase
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">{t("recommended")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
    </Layout>
  );
}
