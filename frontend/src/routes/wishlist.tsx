import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks/useAsync";
import type { ApiProduct } from "@/lib/api/types";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — HyperLocal" },
      { name: "description", content: "Save products for later, watch price drops and move items to your cart." },
      { property: "og:title", content: "Wishlist — HyperLocal" },
      { property: "og:description", content: "Your saved products with price-drop alerts." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { t } = useLang();
  const wishlist = useAsync(
    () => api.users.wishlist() as Promise<{ items: ApiProduct[] }>,
    [],
    true,
  );
  const items = wishlist.data?.items ?? [];

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">{t("wishlist")}</h1>
      <p className="text-sm text-muted-foreground">Price-drop alerts are on for every saved item.</p>
      {wishlist.error && <p className="mt-2 text-sm text-destructive">{wishlist.error}</p>}

      {items.length === 0 ? (
        <div className="card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center">
          <Heart className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("emptyWishlist")}</p>
          <Link to="/search" search={{ q: "", category: undefined }} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} reason={p.oldPrice ? "Price dropped since you saved it" : undefined} />
          ))}
        </div>
      )}
    </Layout>
  );
}
