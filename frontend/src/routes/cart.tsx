import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { getProduct, getSeller } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { cartTotal, useStore } from "@/lib/store";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — HyperLocal" },
      { name: "description", content: "Review items from multiple sellers, update quantities and continue to checkout." },
      { property: "og:title", content: "Your cart — HyperLocal" },
      { property: "og:description", content: "Multi-vendor cart with per-seller delivery estimates." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lang, t } = useLang();
  const { cart, setQty, removeFromCart, toggleWishlist } = useStore();
  const subtotal = cartTotal(cart);
  const delivery = cart.length ? 60 : 0;

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">{t("cart")}</h1>

      {cart.length === 0 ? (
        <div className="card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center">
          <ShoppingCart className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("emptyCart")}</p>
          <Link to="/search" search={{ q: "", category: undefined }} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {cart.map((line) => {
              const p = getProduct(line.productId)!;
              const offer = p.offers.find((o) => o.sellerId === line.sellerId) ?? p.offers[0]!;
              const s = getSeller(offer.sellerId);
              return (
                <div key={line.productId} className="card-surface flex gap-3 p-3">
                  <Link
                    to="/product/$productId"
                    params={{ productId: p.id }}
                    className="flex size-20 shrink-0 items-center justify-center rounded-xl text-3xl"
                    style={{ backgroundImage: p.image }}
                  >
                    {p.emoji}
                  </Link>
                  <div className="flex-1">
                    <Link to="/product/$productId" params={{ productId: p.id }} className="text-sm font-semibold hover:text-primary">
                      {lang === "bn" ? p.nameBn : p.name}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">
                      {lang === "bn" ? s.nameBn : s.name} · {offer.delivery}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-border">
                        <button onClick={() => setQty(p.id, line.qty - 1)} className="p-1.5 hover:bg-secondary" aria-label="Decrease">
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm">{line.qty}</span>
                        <button onClick={() => setQty(p.id, line.qty + 1)} className="p-1.5 hover:bg-secondary" aria-label="Increase">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button onClick={() => toggleWishlist(p.id)} className="text-xs text-primary underline">
                        Save for later
                      </button>
                      <button onClick={() => removeFromCart(p.id)} className="ml-auto rounded-lg p-1.5 text-destructive hover:bg-destructive/10" aria-label="Remove">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <div className="font-display font-bold">{money(offer.price * line.qty, lang)}</div>
                </div>
              );
            })}
          </div>

          <aside className="card-surface h-fit space-y-3 p-4">
            <h2 className="font-display font-bold">Order summary</h2>
            <Row label="Subtotal" value={money(subtotal, lang)} />
            <Row label="Delivery" value={money(delivery, lang)} />
            <Row label="Coin discount" value={"-" + money(0, lang)} />
            <div className="border-t border-border pt-3">
              <Row label={t("total")} value={money(subtotal + delivery, lang)} bold />
            </div>
            <Link to="/checkout" className="block rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground">
              {t("checkout")}
            </Link>
          </aside>
        </div>
      )}
    </Layout>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={"flex justify-between text-sm " + (bold ? "font-display text-base font-bold" : "text-muted-foreground")}>
      <span>{label}</span>
      <span className={bold ? "" : "text-foreground"}>{value}</span>
    </div>
  );
}
