import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { FirebaseSignInButton } from "@/components/FirebaseSignInButton";
import { Eye, EyeOff, LogIn, ServerCrash, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search["redirect"] === "string"
        ? (search["redirect"] as string)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in to your account — HyperLocal" },
      {
        name: "description",
        content:
          "Sign in to track orders, sync your cart and wishlist, and redeem reward coins.",
      },
      { property: "og:title", content: "Sign in — HyperLocal" },
      {
        property: "og:description",
        content: "Access your HyperLocal buyer or seller account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const DEMOS = [
  { label: "Demo buyer", email: "buyer@hyperlocal.test" },
  { label: "Demo seller", email: "seller@hyperlocal.test" },
];

function LoginPage() {
  const { login, offline, user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // remember the last used email (never the password)
  useEffect(() => {
    const saved = window.localStorage.getItem("hl:lastEmail");
    if (saved) setEmail(saved);
  }, []);

  // already signed in → leave the login screen
  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/", replace: true });
  }, [loading, user, redirect, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const trimmed = email.trim().toLowerCase();
      await login(trimmed, password);
      window.localStorage.setItem("hl:lastEmail", trimmed);
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message === "Failed to fetch"
            ? "Cannot reach the API server. Start it with: cd server && npm run dev"
            : err.message
          : "Sign in failed",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user
            ? `Signed in as ${user.name}.`
            : "Use your HyperLocal buyer or seller account."}
        </p>

        {offline && (
          <div className="card-surface mt-4 flex gap-3 p-4 text-sm">
            <ServerCrash className="size-5 shrink-0 text-destructive" />
            <p className="text-muted-foreground">
              The Express API is not reachable. Start it with{" "}
              <code className="font-mono">
                cd server &amp;&amp; npm run dev
              </code>{" "}
              and set <code className="font-mono">VITE_API_URL</code>. The app
              keeps working with demo data meanwhile.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="card-surface mt-4 space-y-4 p-6">
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">Password</span>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <LogIn className="size-4" /> {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <FirebaseSignInButton
            text="signin_with"
            onSuccess={() => navigate({ to: redirect ?? "/", replace: true })}
          />

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Sessions use short-lived tokens
            with an httpOnly refresh cookie.
          </p>

          <p className="text-center text-xs text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="font-semibold text-primary">
              Create one
            </Link>
          </p>

          <div className="flex flex-wrap justify-center gap-2 border-t border-border pt-3">
            {DEMOS.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => {
                  setEmail(d.email);
                  setPassword("Password123");
                }}
                className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold"
              >
                {d.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </Layout>
  );
}
