import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Heart, ShoppingCart, User, Coins, Store, Home, Package, Languages } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { SearchBar } from "./SearchBar";
import { AssistantWidget } from "./AssistantWidget";

const navItems = [
  { to: "/", key: "home", icon: Home },
  { to: "/search", key: "categories", icon: Store },
  { to: "/orders", key: "orders", icon: Package },
  { to: "/rewards", key: "rewards", icon: Coins },
  { to: "/seller", key: "seller", icon: Store },
  { to: "/profile", key: "profile", icon: User },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { lang, setLang, t } = useLang();
  const { cart, wishlist, notifications, coins } = useStore();
  const { user, logout } = useAuth();
  const [bellOpen, setBellOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-lg text-primary-foreground">🛍️</span>
            <span className="font-display text-lg font-bold leading-none">
              {t("brand")}
              <span className="block text-[10px] font-medium text-muted-foreground">Aggregator Platform</span>
            </span>
          </Link>

          <div className="order-3 w-full md:order-2 md:w-auto md:flex-1 md:px-4">
            <SearchBar />
          </div>

          <div className="order-2 ml-auto flex items-center gap-1 md:order-3 md:ml-0">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary"
              title="Switch language"
            >
              <Languages className="size-4" /> {lang === "en" ? "বাংলা" : "EN"}
            </button>

            <div className="relative">
              <button
                onClick={() => setBellOpen((o) => !o)}
                aria-label={t("notifications")}
                className="relative rounded-lg p-2 hover:bg-secondary"
              >
                <Bell className="size-5" />
                <span className="absolute right-1 top-1 size-2 rounded-full bg-destructive" />
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 card-surface p-2">
                  <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("notifications")}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="flex gap-2 rounded-lg p-2 hover:bg-secondary">
                        <span className="text-lg">
                          {n.type === "order" ? "📦" : n.type === "price" ? "📉" : n.type === "reward" ? "🪙" : "⚡"}
                        </span>
                        <div>
                          <p className="text-sm leading-snug">{lang === "bn" ? n.titleBn : n.title}</p>
                          <p className="text-[11px] text-muted-foreground">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/wishlist" className="relative rounded-lg p-2 hover:bg-secondary" aria-label={t("wishlist")}>
              <Heart className="size-5" />
              {wishlist.length > 0 && <Badge>{wishlist.length}</Badge>}
            </Link>

            <Link to="/cart" className="relative rounded-lg p-2 hover:bg-secondary" aria-label={t("cart")}>
              <ShoppingCart className="size-5" />
              {cart.length > 0 && <Badge>{cart.length}</Badge>}
            </Link>

            <Link
              to="/rewards"
              className="hidden items-center gap-1 rounded-lg bg-accent-gradient px-2.5 py-1.5 text-xs font-bold text-accent-foreground sm:flex"
            >
              <Coins className="size-4" /> {coins}
            </Link>

            {user ? (
              <button
                onClick={() => void logout()}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary"
                title={user.email}
              >
                {user.name.split(" ")[0]} · Sign out
              </button>
            ) : (
              <Link to="/login" search={{ redirect: undefined }} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary">
                Sign in
              </Link>
            )}
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 text-sm">
          {navItems.map((item) => {
            const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to + item.key}
                to={item.to}
                className={
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors " +
                  (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")
                }
              >
                <Icon className="size-4" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
          <p className="font-display text-base font-semibold text-foreground">{t("brand")}</p>
          <p className="mt-1 max-w-lg">{t("tagline")}</p>
          <p className="mt-4 text-xs">Data is loaded from the backend API.</p>
        </div>
      </footer>

      <AssistantWidget />
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
      {children}
    </span>
  );
}
