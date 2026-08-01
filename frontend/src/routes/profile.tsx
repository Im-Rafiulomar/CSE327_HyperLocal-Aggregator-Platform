import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { getProduct } from "@/lib/mock-data";
import { useLang, money } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Bell, Coins, Globe, MapPin, Package, Settings, Heart, CreditCard } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — HyperLocal" },
      { name: "description", content: "Manage your account details, addresses, payment methods, notifications and language preference." },
      { property: "og:title", content: "Your profile — HyperLocal" },
      { property: "og:description", content: "Account, addresses, payments and notification settings." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { lang, setLang, t } = useLang();
  const { orders, wishlist, coins, notifications, viewed } = useStore();
  const [prefs, setPrefs] = useState({ order: true, price: true, promo: false, reward: true });

  return (
    <Layout>
      <div className="card-surface flex flex-wrap items-center gap-4 p-6">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-hero-gradient text-2xl font-bold text-primary-foreground">AR</span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Ayesha Rahman</h1>
          <p className="text-sm text-muted-foreground">ayesha.r@example.com · +880 1712 345678</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> Dhanmondi 27, Dhaka · Silver member since 2023
          </p>
        </div>
        <Link to="/seller" className="rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">
          Switch to seller view
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          { icon: Package, label: t("orders"), value: orders.length, to: "/orders" as const },
          { icon: Heart, label: t("wishlist"), value: wishlist.length, to: "/wishlist" as const },
          { icon: Coins, label: t("coins"), value: coins, to: "/rewards" as const },
          { icon: Bell, label: t("notifications"), value: notifications.length, to: "/profile" as const },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="card-surface flex items-center gap-3 p-4 hover:bg-secondary/50">
            <s.icon className="size-5 text-primary" />
            <div>
              <div className="font-display text-lg font-bold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><Settings className="size-4" /> Account details</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value="Ayesha Rahman" />
            <Field label="Phone" value="+880 1712 345678" />
            <Field label="Email" value="ayesha.r@example.com" />
            <Field label="Default area" value="Dhanmondi, Dhaka" />
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><CreditCard className="size-4" /> Saved payments</h2>
          <div className="mt-3 space-y-2 text-sm">
            {[["bKash", "•••• 5678", "Default"], ["Visa", "•••• 4242", ""], ["HyperLocal wallet", money(1820, lang), ""]].map(([a, b, c]) => (
              <div key={a} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{a}</span>
                <span className="text-muted-foreground">{b}</span>
                {c && <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold">{c}</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><Bell className="size-4" /> Notification preferences</h2>
          <div className="mt-3 space-y-2">
            {([
              ["order", "Order updates"],
              ["price", "Price drops on wishlist"],
              ["promo", "Promotions & flash sales"],
              ["reward", "Coins & coupon expiry"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                {label}
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="accent-[var(--primary)]"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><Globe className="size-4" /> Language</h2>
          <div className="mt-3 flex gap-2">
            {(["en", "bn"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={"flex-1 rounded-xl border px-4 py-3 text-sm font-semibold " + (lang === l ? "border-primary bg-primary text-primary-foreground" : "border-border")}
              >
                {l === "en" ? "English" : "বাংলা"}
              </button>
            ))}
          </div>

          <h3 className="mt-5 font-display font-bold">Recently viewed</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {viewed.map((id) => {
              const p = getProduct(id);
              if (!p) return null;
              return (
                <Link
                  key={id}
                  to="/product/$productId"
                  params={{ productId: id }}
                  className="flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary"
                >
                  <span>{p.emoji}</span> {(lang === "bn" ? p.nameBn : p.name).slice(0, 24)}
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <input defaultValue={value} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
    </label>
  );
}
