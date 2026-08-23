import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/auth";
import { FirebaseSignInButton } from "@/components/FirebaseSignInButton";
import { UserPlus, Store, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create a buyer or seller account — HyperLocal" },
      {
        name: "description",
        content:
          "Open a HyperLocal account to shop from local vendors, or register your shop as a seller.",
      },
      { property: "og:title", content: "Create your account — HyperLocal" },
      {
        property: "og:description",
        content:
          "Buyer and seller registration for the HyperLocal marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    area: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role,
        shopName: role === "seller" ? form.shopName.trim() : undefined,
        area: role === "seller" ? form.area.trim() : undefined,
      });
      navigate({ to: role === "seller" ? "/seller" : "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2";

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Buyers shop locally; sellers get a storefront and dashboard.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ["buyer", "I'm shopping", ShoppingBag],
              ["seller", "I sell products", Store],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={
                "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold " +
                (role === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border")
              }
            >
              <Icon className="size-4" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="card-surface mt-4 space-y-4 p-6">
          <label className="block text-sm">
            <span className="font-medium">Full name</span>
            <input
              required
              minLength={2}
              maxLength={80}
              value={form.name}
              onChange={set("name")}
              className={field}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              maxLength={255}
              value={form.email}
              onChange={set("email")}
              className={field}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone (optional)</span>
            <input
              maxLength={20}
              value={form.phone}
              onChange={set("phone")}
              className={field}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Password</span>
            <input
              type="password"
              required
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={set("password")}
              className={field}
            />
            <span className="text-xs text-muted-foreground">
              At least 8 characters.
            </span>
          </label>

          {role === "seller" && (
            <>
              <label className="block text-sm">
                <span className="font-medium">Shop name</span>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.shopName}
                  onChange={set("shopName")}
                  className={field}
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium">Area</span>
                <input
                  maxLength={120}
                  placeholder="Dhanmondi, Dhaka"
                  value={form.area}
                  onChange={set("area")}
                  className={field}
                />
              </label>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            <UserPlus className="size-4" />{" "}
            {busy ? "Creating…" : "Create account"}
          </button>

          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or{" "}
            <span className="h-px flex-1 bg-border" />
          </div>

          <FirebaseSignInButton
            text="signup_with"
            role={role}
            shopName={
              role === "seller" ? form.shopName.trim() || undefined : undefined
            }
            area={role === "seller" ? form.area.trim() || undefined : undefined}
            onSuccess={() =>
              navigate({ to: role === "seller" ? "/seller" : "/" })
            }
          />

          <p className="text-center text-xs text-muted-foreground">
            Already registered?{" "}
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="font-semibold text-primary"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}
