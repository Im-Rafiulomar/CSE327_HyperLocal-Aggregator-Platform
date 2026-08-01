import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { getProduct } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { cartTotal, useStore } from "@/lib/store";
import { Banknote, CreditCard, Smartphone, Wallet, CheckCircle2 } from "lucide-react";

const methods = [
  { id: "cod", label: "Cash on Delivery", labelBn: "ক্যাশ অন ডেলিভারি", icon: Banknote, note: "Pay the rider on arrival" },
  { id: "card", label: "Credit / Debit card", labelBn: "কার্ড", icon: CreditCard, note: "Visa, Mastercard, Amex" },
  { id: "bkash", label: "Mobile banking", labelBn: "মোবাইল ব্যাংকিং", icon: Smartphone, note: "bKash, Nagad, Rocket" },
  { id: "wallet", label: "Digital wallet", labelBn: "ডিজিটাল ওয়ালেট", icon: Wallet, note: "HyperLocal wallet balance ৳1,820" },
];

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — HyperLocal" },
      { name: "description", content: "Pay with cash on delivery, card, mobile banking or digital wallet." },
      { property: "og:title", content: "Checkout — HyperLocal" },
      { property: "og:description", content: "Multiple payment methods with coin redemption at checkout." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lang, t } = useLang();
  const navigate = useNavigate();
  const { cart, placeOrder, coins, spendCoins } = useStore();
  const [method, setMethod] = useState("cod");
  const [useCoins, setUseCoins] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  const subtotal = cartTotal(cart);
  const delivery = cart.length ? 60 : 0;
  const coinDiscount = useCoins ? Math.min(coins, 500) : 0;
  const total = Math.max(0, subtotal + delivery - coinDiscount);

  const submit = () => {
    if (!cart.length) return;
    if (useCoins) spendCoins(coinDiscount);
    const id = placeOrder(methods.find((m) => m.id === method)!.label, total);
    setPlaced(id);
  };

  if (placed) {
    return (
      <Layout>
        <div className="card-surface mx-auto mt-10 max-w-lg p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h1 className="mt-3 font-display text-2xl font-bold">Order placed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Order <strong>#{placed}</strong> is confirmed. A push notification was sent with tracking details.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link to="/orders" className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              {t("trackOrder")}
            </Link>
            <button onClick={() => navigate({ to: "/" })} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
              Keep shopping
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">{t("checkout")}</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <section className="card-surface p-4">
            <h2 className="font-display font-bold">Delivery address</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value="Ayesha Rahman" />
              <Field label="Phone" value="+880 1712 345678" />
              <Field label="Area" value="Dhanmondi 27, Dhaka" />
              <Field label="Address" value="House 14, Road 9/A, Flat 3B" />
            </div>
          </section>

          <section className="card-surface p-4">
            <h2 className="font-display font-bold">Payment method</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={
                    "flex items-start gap-3 rounded-xl border p-3 text-left " +
                    (method === m.id ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60")
                  }
                >
                  <m.icon className="mt-0.5 size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">{lang === "bn" ? m.labelBn : m.label}</p>
                    <p className="text-[11px] text-muted-foreground">{m.note}</p>
                  </div>
                </button>
              ))}
            </div>
            {method === "card" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Card number" value="4242 4242 4242 4242" span />
                <Field label="Expiry" value="09/29" />
              </div>
            )}
            {method === "bkash" && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="bKash number" value="+880 1712 345678" />
                <Field label="OTP" value="••••" />
              </div>
            )}
          </section>
        </div>

        <aside className="card-surface h-fit space-y-3 p-4">
          <h2 className="font-display font-bold">{cart.length} items</h2>
          {cart.map((l) => {
            const p = getProduct(l.productId)!;
            const offer = p.offers.find((o) => o.sellerId === l.sellerId) ?? p.offers[0]!;
            return (
              <div key={l.productId} className="flex justify-between text-sm">
                <span className="truncate pr-2 text-muted-foreground">
                  {l.qty}× {lang === "bn" ? p.nameBn : p.name}
                </span>
                <span>{money(offer.price * l.qty, lang)}</span>
              </div>
            );
          })}
          <label className="flex items-center gap-2 border-t border-border pt-3 text-sm">
            <input type="checkbox" checked={useCoins} onChange={(e) => setUseCoins(e.target.checked)} className="accent-[var(--primary)]" />
            Redeem 500 {t("coins")} (−{money(500, lang)})
          </label>
          <div className="space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal, lang)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>{money(delivery, lang)}</span></div>
            <div className="flex justify-between"><span>Coins</span><span>−{money(coinDiscount, lang)}</span></div>
            <div className="flex justify-between pt-2 font-display text-base font-bold text-foreground">
              <span>{t("total")}</span><span>{money(total, lang)}</span>
            </div>
          </div>
          <button
            onClick={submit}
            disabled={!cart.length}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {t("placeOrder")}
          </button>
        </aside>
      </div>
    </Layout>
  );
}

function Field({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <label className={"block text-xs font-medium text-muted-foreground " + (span ? "sm:col-span-2" : "")}>
      {label}
      <input defaultValue={value} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
