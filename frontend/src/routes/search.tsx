import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { SlidersHorizontal } from "lucide-react";

type SearchParams = { q: string; category: string | undefined };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s["q"] === "string" ? (s["q"] as string) : "",
    category: typeof s["category"] === "string" ? (s["category"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search products & categories — HyperLocal" },
      { name: "description", content: "Search by name, brand or category with filters for price, rating, local sellers and delivery speed." },
      { property: "og:title", content: "Search products — HyperLocal" },
      { property: "og:description", content: "Filter and sort listings from local shops and online retailers." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q, category } = Route.useSearch();
  const { lang, t } = useLang();
  const [cat, setCat] = useState<string | undefined>(category);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [localOnly, setLocalOnly] = useState(false);
  const [sort, setSort] = useState("relevance");

  const term = q.toLowerCase();
  let list = products.filter((p) => {
    const matches =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.nameBn.includes(q) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.includes(term) ||
      term.split(" ").some((w: string) => w.length > 3 && p.name.toLowerCase().includes(w));
    return matches && (!cat || p.category === cat) && p.price <= maxPrice && p.rating >= minRating;
  });
  if (localOnly) list = list.filter((p) => p.offers.some((o) => ["s1", "s3", "s4"].includes(o.sellerId)));
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">
        {q ? `“${q}”` : lang === "bn" ? "সব পণ্য" : "All products"}{" "}
        <span className="text-base font-normal text-muted-foreground">
          · {list.length} {t("results")}
        </span>
      </h1>

      <div className="mt-4 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="card-surface h-fit space-y-5 p-4">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <SlidersHorizontal className="size-4" /> {t("filters")}
          </h2>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t("categories")}</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setCat(undefined)}
                className={"rounded-full border px-2.5 py-1 text-xs " + (!cat ? "border-primary bg-primary text-primary-foreground" : "border-border")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id === cat ? undefined : c.id)}
                  className={"rounded-full border px-2.5 py-1 text-xs " + (cat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                >
                  {c.emoji} {lang === "bn" ? c.nameBn : c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Max price · {money(maxPrice, lang)}
            </p>
            <input
              type="range"
              min={500}
              max={10000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Minimum rating</p>
            <div className="flex gap-1.5">
              {[0, 4, 4.5].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={"rounded-lg border px-2.5 py-1 text-xs " + (minRating === r ? "border-primary bg-primary text-primary-foreground" : "border-border")}
                >
                  {r === 0 ? "Any" : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={localOnly} onChange={(e) => setLocalOnly(e.target.checked)} className="accent-[var(--primary)]" />
            {lang === "bn" ? "শুধু স্থানীয় বিক্রেতা" : "Local sellers only"}
          </label>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t("sortBy")}</p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>

        <div>
          {list.length === 0 ? (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              No products matched. Try clearing filters or searching a category like “grocery”.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
