import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { coupons } from "@/lib/mock-data";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Coins, Gift, Ticket, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards & coupons — HyperLocal" },
      { name: "description", content: "Earn coins on every order and redeem them for discounts, vouchers and free delivery." },
      { property: "og:title", content: "Rewards & coupons — HyperLocal" },
      { property: "og:description", content: "Loyalty coins, redeemable vouchers and tier progress." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { t } = useLang();
  const { coins, spendCoins, pushNotification } = useStore();
  const [claimed, setClaimed] = useState<string[]>([]);

  const redeem = (code: string, cost: number) => {
    if (spendCoins(cost)) {
      setClaimed((c) => [...c, code]);
      pushNotification({ type: "reward", title: `Coupon ${code} added to your account`, titleBn: `কুপন ${code} যুক্ত হয়েছে` });
    }
  };

  const nextTier = 2000;

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold">{t("rewards")}</h1>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="card-surface bg-hero-gradient p-6 text-primary-foreground md:col-span-2">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <Coins className="size-4" /> Coin balance
          </div>
          <div className="font-display text-4xl font-extrabold">{coins}</div>
          <p className="mt-1 text-xs opacity-80">100 coins = ৳100 off · earn 1 coin per ৳50 spent</p>
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-primary-foreground/25">
              <div className="h-full rounded-full bg-accent-gradient" style={{ width: `${Math.min(100, (coins / nextTier) * 100)}%` }} />
            </div>
            <p className="mt-1 text-xs opacity-80">
              {Math.max(0, nextTier - coins)} coins to Gold tier (free delivery on all local orders)
            </p>
          </div>
        </div>

        <div className="card-surface space-y-3 p-5">
          <h2 className="flex items-center gap-2 font-display font-bold">
            <TrendingUp className="size-4 text-primary" /> How you earned
          </h2>
          {[
            ["Order #HL-2291", "+129"],
            ["Order #HL-2264", "+70"],
            ["Review with photo", "+25"],
            ["Referred a friend", "+200"],
          ].map(([label, amt]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold text-success">{amt}</span>
            </div>
          ))}
        </div>
      </div>

      <h2 className="mt-8 flex items-center gap-2 font-display text-xl font-bold">
        <Ticket className="size-5 text-accent" /> Redeem coupons
      </h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        {coupons.map((c) => {
          const done = claimed.includes(c.code);
          return (
            <div key={c.code} className="card-surface flex flex-col gap-2 p-5">
              <span className="w-fit rounded-lg bg-accent-gradient px-2 py-0.5 font-mono text-xs font-bold text-accent-foreground">{c.code}</span>
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted-foreground">Expires {c.expires}</p>
              <button
                onClick={() => redeem(c.code, c.cost)}
                disabled={done || coins < c.cost}
                className="mt-auto rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground disabled:opacity-40"
              >
                {done ? "✓ Claimed" : `${t("redeem")} · ${c.cost} ${t("coins")}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card-surface mt-8 flex items-center gap-4 p-5">
        <Gift className="size-8 text-accent" />
        <div>
          <p className="font-display font-bold">Refer a neighbour, earn 200 coins</p>
          <p className="text-xs text-muted-foreground">They get ৳150 off their first local order. Code: AYESHA200</p>
        </div>
      </div>
    </Layout>
  );
}
