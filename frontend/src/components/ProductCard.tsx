import { Link } from "@tanstack/react-router";
import { useLang, money } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { ApiOffer, ApiProduct, SellerProfile } from "@/lib/api/types";
import { Heart, Star, MapPin } from "lucide-react";

function sellerFromOffer(offer: ApiOffer): SellerProfile | null {
  return typeof offer.seller === "string" ? null : offer.seller;
}

function sellerIdFromOffer(offer: ApiOffer): string {
  return typeof offer.seller === "string" ? offer.seller : offer.seller._id;
}

export function ProductCard({ product, reason }: { product: ApiProduct; reason?: string | undefined }) {
  const { lang, t } = useLang();
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const saved = wishlist.includes(product._id);
  const best = [...product.offers].sort((a, b) => a.price - b.price)[0]!;
  const seller = sellerFromOffer(best);
  const sellerId = sellerIdFromOffer(best);

  return (
    <div className="group card-surface flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lift">
      <Link to="/product/$productId" params={{ productId: product.slug }} className="relative block">
        <div className="flex h-44 items-center justify-center overflow-hidden bg-secondary/30 text-5xl" aria-hidden>
          {product.image && !product.image.startsWith("linear-gradient") ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            product.emoji ?? "📦"
          )}
        </div>
        {product.oldPrice && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground shadow-sm">
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            to="/product/$productId"
            params={{ productId: product.slug }}
            className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
          >
            {lang === "bn" && product.nameBn ? product.nameBn : product.name}
          </Link>
          <button
            onClick={() => void toggleWishlist(product._id)}
            aria-label="wishlist"
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
          >
            <Heart className={"size-4 " + (saved ? "fill-destructive text-destructive" : "")} />
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3.5 fill-accent text-accent" />
          {product.rating} · {product.reviewCount} {t("reviews")}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="truncate">
            {seller ? (lang === "bn" && seller.nameBn ? seller.nameBn : seller.name) : "Seller"}
          </span>
        </div>

        {reason && (
          <p className="rounded-md bg-secondary px-2 py-1 text-[11px] leading-snug text-secondary-foreground">{reason}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="font-display text-lg font-bold">{money(best.price, lang)}</div>
            {product.oldPrice && (
              <div className="text-xs text-muted-foreground line-through">{money(product.oldPrice, lang)}</div>
            )}
            <div className="text-[11px] text-muted-foreground">
              {product.offers.length} sellers from {money(best.price, lang)}
            </div>
          </div>
          <button
            onClick={() => void addToCart(product.slug, sellerId)}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
