import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ListingForm } from "@/components/seller/ListingForm";
import { useLang, money } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks/useAsync";
import type { ApiProduct, ListingInput, SellerProfile } from "@/lib/api/types";
import { Sparkles, Star, ShieldCheck, TrendingUp, Package, Clock, Loader2, Trash2, Save, Store } from "lucide-react";

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

type Dashboard = {
  seller?: SellerProfile;
  listings: ApiProduct[];
  metrics: { revenue: number; orders: number; unitsSold: number; onTimeRate: number; rating: number };
  insights: { tag: string; text: string }[];
};

function SellerPage() {
  const { lang } = useLang();
  const { user, sellerProfile, isSeller, loading: authLoading } = useAuth();
  const live = isSeller;

  const dash = useAsync<Dashboard>(
    () => api.sellers.dashboard() as unknown as Promise<Dashboard>,
    [user?.id],
    live,
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your shop…
        </div>
      </Layout>
    );
  }

  if (!live) {
    return (
      <Layout>
        <div className="card-surface mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-accent p-4">
          <p className="text-sm text-muted-foreground">
            Sign in with a seller account to load your shop data from the backend.
          </p>
          <Link to="/login" search={{ redirect: "/seller" }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Sign in as seller
          </Link>
        </div>
      </Layout>
    );
  }

  const data = dash.data;
  const shop = data?.seller ?? sellerProfile;
  const listings = data?.listings ?? [];
  const metrics = data?.metrics;

  const createListing = async (input: ListingInput) => {
    await api.sellers.createProduct(input);
    dash.reload();
  };

  return (
    <Layout>
      <div className="card-surface flex flex-wrap items-center gap-4 p-6">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-accent-gradient text-2xl text-accent-foreground">🏪</span>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            {shop ? (lang === "bn" && shop.nameBn ? shop.nameBn : shop.name) : user?.name}
            {shop?.verified && <ShieldCheck className="size-5 text-success" />}
          </h1>
          <p className="text-sm text-muted-foreground">
            {[shop?.area, shop?.since && `since ${shop.since}`, shop?.responseTime && `replies in ${shop.responseTime}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Star className="size-4 fill-accent text-accent" /> {shop?.rating ?? "—"} · {listings.length} active listings
          </p>
        </div>
        <Link to="/profile" className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">
          <Store className="size-4" /> Account
        </Link>
      </div>

      {dash.error && (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {dash.error}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Revenue", value: money(metrics?.revenue ?? 0, lang) },
          { icon: Package, label: "Orders", value: String(metrics?.orders ?? 0) },
          { icon: Clock, label: "On-time delivery", value: `${metrics?.onTimeRate ?? 0}%` },
          { icon: Star, label: "Units sold", value: String(metrics?.unitsSold ?? 0) },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4">
            <s.icon className="size-5 text-primary" />
            <div className="mt-2 font-display text-xl font-bold">{dash.loading ? "…" : s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="card-surface p-5">
            <h2 className="font-display font-bold">Add a new listing</h2>
            <p className="text-xs text-muted-foreground">Published straight to your shop — ownership is verified server-side.</p>
            <ListingForm onSubmit={createListing} />
          </section>

          <section className="card-surface p-5">
            <h2 className="font-display font-bold">Your listings</h2>
            {dash.loading && <p className="mt-3 text-sm text-muted-foreground">Loading listings…</p>}
            {!dash.loading && listings.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">No listings yet — publish your first product above.</p>
            )}
            <div className="mt-2 divide-y divide-border">
              {listings.map((p) => (
                <ListingRow key={p._id} product={p} sellerId={shop?._id} onChanged={dash.reload} />
              ))}
            </div>
          </section>
        </div>

        <aside className="card-surface h-fit space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <Sparkles className="size-4 text-primary" /> AI decision support
          </h2>
          {(data?.insights ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No recommendations right now — your listings look healthy.</p>
          )}
          {(data?.insights ?? []).map((i, idx) => (
            <div key={`${i.tag}-${idx}`} className="rounded-xl bg-secondary p-3">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary">{i.tag}</span>
              <p className="text-sm leading-snug">{i.text}</p>
            </div>
          ))}
        </aside>
      </div>
    </Layout>
  );
}

function ListingRow({
  product,
  sellerId,
  onChanged,
}: {
  product: ApiProduct;
  sellerId?: string | undefined;
  onChanged: () => void;
}) {
  const { lang } = useLang();
  const mine = product.offers.find((o) => {
    const id = typeof o.seller === "string" ? o.seller : o.seller?._id;
    return !sellerId || String(id) === String(sellerId);
  });
  const [price, setPrice] = useState(String(mine?.price ?? product.price));
  const [stock, setStock] = useState(String(mine?.stock ?? 0));
  const [busy, setBusy] = useState<"save" | "delete" | null>(null);
  const cheapest = Math.min(...product.offers.map((o) => o.price));

  const save = async () => {
    setBusy("save");
    try {
      await api.sellers.updateProduct(product.slug, { price: Number(price), stock: Number(stock) });
      onChanged();
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    setBusy("delete");
    try {
      await api.sellers.deleteProduct(product.slug);
      onChanged();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary/40 text-lg">
        {product.image && !product.image.startsWith("linear-gradient") ? (
          <img
            src={product.image}
            alt=""
            className="size-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = "none";
            }}
          />
        ) : (
          (product.emoji ?? "📦")
        )}
      </span>
      <div className="min-w-40 flex-1">
        <p className="text-sm font-medium">{lang === "bn" && product.nameBn ? product.nameBn : product.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {product.category}
          {mine && mine.price > cheapest && (
            <span className="ml-2 text-destructive">{money(mine.price - cheapest, lang)} above lowest</span>
          )}
        </p>
      </div>
      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        type="number"
        className="w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        aria-label="Price"
      />
      <input
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        type="number"
        className="w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        aria-label="Stock"
      />
      <button onClick={save} disabled={busy !== null} className="rounded-lg border border-border p-2 hover:bg-secondary" aria-label="Save listing">
        {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      </button>
      <button onClick={remove} disabled={busy !== null} className="rounded-lg border border-border p-2 text-destructive hover:bg-secondary" aria-label="Remove listing">
        {busy === "delete" ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      </button>
    </div>
  );
}
