import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

const dict = {
  brand: { en: "HyperLocal", bn: "হাইপারলোকাল" },
  tagline: { en: "Local shops. Online reach. One smart marketplace.", bn: "স্থানীয় দোকান। অনলাইন পরিসর। একটি স্মার্ট মার্কেটপ্লেস।" },
  searchPlaceholder: { en: "Search products, brands or shops…", bn: "পণ্য, ব্র্যান্ড বা দোকান খুঁজুন…" },
  home: { en: "Home", bn: "হোম" },
  categories: { en: "Categories", bn: "ক্যাটাগরি" },
  assistant: { en: "AI Assistant", bn: "এআই সহকারী" },
  orders: { en: "Orders", bn: "অর্ডার" },
  wishlist: { en: "Wishlist", bn: "উইশলিস্ট" },
  cart: { en: "Cart", bn: "কার্ট" },
  rewards: { en: "Rewards", bn: "রিওয়ার্ড" },
  profile: { en: "Profile", bn: "প্রোফাইল" },
  seller: { en: "Seller", bn: "বিক্রেতা" },
  notifications: { en: "Notifications", bn: "নোটিফিকেশন" },
  addToCart: { en: "Add to cart", bn: "কার্টে যোগ করুন" },
  buyNow: { en: "Buy now", bn: "এখনই কিনুন" },
  compareSellers: { en: "Compare sellers", bn: "বিক্রেতা তুলনা" },
  recommended: { en: "Recommended for you", bn: "আপনার জন্য প্রস্তাবিত" },
  trending: { en: "Trending near you", bn: "আপনার আশেপাশে জনপ্রিয়" },
  visualSearch: { en: "Visual search", bn: "ছবি দিয়ে খুঁজুন" },
  voiceSearch: { en: "Voice search", bn: "ভয়েস সার্চ" },
  reviews: { en: "Reviews", bn: "রিভিউ" },
  aiSummary: { en: "AI review summary", bn: "এআই রিভিউ সারাংশ" },
  flagged: { en: "Flagged as suspicious", bn: "সন্দেহজনক হিসেবে চিহ্নিত" },
  checkout: { en: "Checkout", bn: "চেকআউট" },
  total: { en: "Total", bn: "মোট" },
  emptyCart: { en: "Your cart is empty", bn: "আপনার কার্ট খালি" },
  emptyWishlist: { en: "Nothing saved yet", bn: "কিছু সংরক্ষিত নেই" },
  trackOrder: { en: "Track order", bn: "অর্ডার ট্র্যাক" },
  coins: { en: "coins", bn: "কয়েন" },
  redeem: { en: "Redeem", bn: "রিডিম" },
  placeOrder: { en: "Place order", bn: "অর্ডার করুন" },
  filters: { en: "Filters", bn: "ফিল্টার" },
  sortBy: { en: "Sort by", bn: "সাজান" },
  specs: { en: "Specifications", bn: "স্পেসিফিকেশন" },
  localSeller: { en: "Local seller", bn: "স্থানীয় বিক্রেতা" },
  verified: { en: "Verified", bn: "যাচাইকৃত" },
  results: { en: "results", bn: "ফলাফল" },
} as const;

export type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict[k].en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("hl-lang") as Lang | null;
    if (saved) setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("hl-lang", lang);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: (k: Key) => dict[k][lang] }), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
export function money(n: number, lang: Lang) {
  const s = n.toLocaleString("en-US");
  return "৳" + (lang === "bn" ? s.replace(/\d/g, (d) => bnDigits[Number(d)]!) : s);
}
export function num(n: number, lang: Lang) {
  const s = String(n);
  return lang === "bn" ? s.replace(/\d/g, (d) => bnDigits[Number(d)]!) : s;
}
