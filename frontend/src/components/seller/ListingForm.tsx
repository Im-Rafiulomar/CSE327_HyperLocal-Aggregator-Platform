import { useState } from "react";
import { Loader2, PackagePlus } from "lucide-react";
import type { ListingInput } from "@/lib/api/types";

const EMPTY: ListingInput = {
  name: "",
  nameBn: "",
  brand: "",
  category: "grocery",
  description: "",
  emoji: "📦",
  price: 0,
  stock: 1,
  delivery: "Same-day",
  tags: [],
};

const CATEGORIES = ["grocery", "electronics", "fashion", "home", "beauty", "pharmacy", "handicraft"];

/**
 * Presentational create-listing form. It owns only draft state and delegates
 * persistence to the caller (Dependency Inversion — no API import here).
 */
export function ListingForm({ onSubmit }: { onSubmit: (input: ListingInput) => Promise<void> }) {
  const [draft, setDraft] = useState<ListingInput>(EMPTY);
  const [tagText, setTagText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const set = <K extends keyof ListingInput>(key: K, value: ListingInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      await onSubmit({
        ...draft,
        price: Number(draft.price),
        stock: Number(draft.stock),
        tags: tagText.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setDraft(EMPTY);
      setTagText("");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the listing");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
      <Input label="Product name" value={draft.name} onChange={(v) => set("name", v)} required />
      <Input label="Bangla name (optional)" value={draft.nameBn ?? ""} onChange={(v) => set("nameBn", v)} />
      <Input label="Brand" value={draft.brand ?? ""} onChange={(v) => set("brand", v)} />
      <label className="block text-xs font-medium text-muted-foreground">
        Category
        <select
          value={draft.category}
          onChange={(e) => set("category", e.target.value)}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <Input label="Price (৳)" type="number" value={String(draft.price)} onChange={(v) => set("price", Number(v))} required />
      <Input label="Stock" type="number" value={String(draft.stock)} onChange={(v) => set("stock", Number(v))} required />
      <Input label="Emoji" value={draft.emoji ?? ""} onChange={(v) => set("emoji", v)} />
      <Input label="Delivery promise" value={draft.delivery ?? ""} onChange={(v) => set("delivery", v)} />
      <Input label="Tags (comma separated)" value={tagText} onChange={setTagText} className="sm:col-span-2" />
      <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">
        Description
        <textarea
          value={draft.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
      {done && <p className="text-sm text-success sm:col-span-2">Listing published to your shop.</p>}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:col-span-2"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <PackagePlus className="size-4" />}
        Publish listing
      </button>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={"block text-xs font-medium text-muted-foreground " + className}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
