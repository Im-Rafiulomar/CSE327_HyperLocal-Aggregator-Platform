import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useLang, money } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { ApiAddress } from "@/lib/api/types";
import { Bell, Coins, Globe, MapPin, Package, Settings, Heart, CreditCard, ShieldCheck, Store, Loader2, Check } from "lucide-react";

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

const PREF_KEYS = [
  ["order", "Order updates"],
  ["price", "Price drops on wishlist"],
  ["promo", "Promotions & flash sales"],
  ["reward", "Coins & coupon expiry"],
] as const;

function ProfilePage() {
  const { lang, setLang, t } = useLang();
  const { orders, wishlist, coins, notifications, viewed } = useStore();
  const { user, sellerProfile, isSeller, loading, offline, setUser } = useAuth();

  const live = !!user;
  const [form, setForm] = useState({ name: "", phone: "", email: "", area: "" });
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ order: true, price: true, promo: false, reward: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const def = (user.addresses ?? []).find((a: ApiAddress) => a.isDefault) ?? user.addresses?.[0];
    setForm({
      name: user.name ?? "",
      phone: user.phone ?? "",
      email: user.email ?? "",
      area: [def?.area, def?.city].filter(Boolean).join(", "),
    });
    setPrefs({ order: true, price: true, promo: false, reward: true, ...(user.notificationPrefs ?? {}) });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.users.updateProfile({
        name: form.name,
        phone: form.phone,
        language: lang,
        notificationPrefs: prefs,
      });
      setUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center gap-2 p-10 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading your profile…
        </div>
      </Layout>
    );
  }

  const displayName = user?.name ?? "Ayesha Rahman";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const statCoins = user?.coins ?? coins;
  const statWishlist = user ? user.wishlist.length : wishlist.length;

  return (
    <Layout>
      {!live && (
        <div className="card-surface mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-accent p-4">
          <p className="text-sm text-muted-foreground">
            {offline
              ? "The API isn’t reachable. Start the Express server to load your account."
              : "You’re browsing as a guest. Sign in to see your real profile, orders and rewards."}
          </p>
          <Link to="/login" search={{ redirect: "/profile" }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Sign in
          </Link>
        </div>
      )}

      <div className="card-surface flex flex-wrap items-center gap-4 p-6">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-hero-gradient text-2xl font-bold text-primary-foreground">
          {user?.avatarEmoji || initials}
        </span>
        <div className="flex-1">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold">
            {displayName}
            {live && <ShieldCheck className="size-5 text-success" />}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.email ?? "ayesha.r@example.com"}
            {(user?.phone || !live) && ` · ${user?.phone ?? "+880 1712 345678"}`}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5" /> {form.area || "Dhanmondi 27, Dhaka"} ·{" "}
            {live ? `${user?.role} account` : "Silver member since 2023"}
          </p>
        </div>
        {(isSeller || !live) && (
          <Link to="/seller" className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <Store className="size-4" /> {isSeller ? "Seller dashboard" : "Switch to seller view"}
          </Link>
        )}
      </div>

      {live && sellerProfile && (
        <div className="card-surface mt-4 flex flex-wrap items-center gap-3 p-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-accent-gradient text-xl text-accent-foreground">🏪</span>
          <div className="flex-1">
            <p className="font-display font-bold">
              {lang === "bn" && sellerProfile.nameBn ? sellerProfile.nameBn : sellerProfile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {sellerProfile.area} · rating {sellerProfile.rating ?? "—"} · {sellerProfile.verified ? "verified shop" : "verification pending"}
            </p>
          </div>
          <Link to="/seller" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Manage shop
          </Link>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-4">
        {[
          { icon: Package, label: t("orders"), value: orders.length, to: "/orders" as const },
          { icon: Heart, label: t("wishlist"), value: statWishlist, to: "/wishlist" as const },
          { icon: Coins, label: t("coins"), value: statCoins, to: "/rewards" as const },
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
            <Field label="Full name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
            <Field label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <Field label="Email" value={form.email} readOnly />
            <Field label="Default area" value={form.area} onChange={(v) => setForm((f) => ({ ...f, area: v }))} readOnly={!live} />
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          <button
            onClick={save}
            disabled={!live || saving}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <Check className="size-4" /> : null}
            {saved ? "Saved" : "Save changes"}
          </button>
          {!live && <p className="mt-2 text-xs text-muted-foreground">Sign in to edit your account.</p>}
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><CreditCard className="size-4" /> Saved payments</h2>
          <div className="mt-3 space-y-2 text-sm">
            {[["bKash", "•••• 5678", "Default"], ["Visa", "•••• 4242", ""], ["HyperLocal wallet", money(statCoins, lang), ""]].map(([a, b, c]) => (
              <div key={a} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{a}</span>
                <span className="text-muted-foreground">{b}</span>
                {c && <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold">{c}</span>}
              </div>
            ))}
          </div>

          {live && (user?.addresses?.length ?? 0) > 0 && (
            <>
              <h3 className="mt-5 font-display font-bold">Delivery addresses</h3>
              <div className="mt-2 space-y-2 text-sm">
                {user!.addresses!.map((a, i) => (
                  <div key={a._id ?? i} className="rounded-lg border border-border px-3 py-2">
                    <span className="font-medium">{a.label ?? "Address"}</span>{" "}
                    <span className="text-muted-foreground">
                      {[a.line1, a.area, a.city].filter(Boolean).join(", ")}
                    </span>
                    {a.isDefault && <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold">Default</span>}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="card-surface p-5">
          <h2 className="flex items-center gap-2 font-display font-bold"><Bell className="size-4" /> Notification preferences</h2>
          <div className="mt-3 space-y-2">
            {PREF_KEYS.map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                {label}
                <input
                  type="checkbox"
                  checked={!!prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: e.target.checked }))}
                  className="accent-primary"
                />
              </label>
            ))}
          </div>
          {live && <p className="mt-2 text-xs text-muted-foreground">Preferences are stored with “Save changes”.</p>}
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
            {viewed.map((slug) => (
              <Link
                key={slug}
                to="/product/$productId"
                params={{ productId: slug }}
                className="flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary"
              >
                <span>📦</span> {slug.slice(0, 28)}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block text-xs font-medium text-muted-foreground">
      {label}
      <input
        value={value}
        readOnly={readOnly || !onChange}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring read-only:opacity-70"
      />
    </label>
  );
}
