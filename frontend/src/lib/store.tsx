import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { notificationsSeed, orderSeed, products } from "./mock-data";

export type CartLine = { productId: string; sellerId: string; qty: number };
export type Order = {
  id: string;
  date: string;
  items: { productId: string; qty: number }[];
  total: number;
  payment: string;
  status: number;
  seller: string;
};
export type AppNotification = { id: string; type: string; title: string; titleBn: string; time: string };

type Store = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  notifications: AppNotification[];
  coins: number;
  viewed: string[];
  addToCart: (productId: string, sellerId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  placeOrder: (payment: string, total: number) => string;
  markViewed: (productId: string) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "time">) => void;
  spendCoins: (n: number) => boolean;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([{ productId: "p3", sellerId: "s4", qty: 1 }]);
  const [wishlist, setWishlist] = useState<string[]>(["p1", "p6"]);
  const [orders, setOrders] = useState<Order[]>(orderSeed);
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationsSeed);
  const [coins, setCoins] = useState(1240);
  const [viewed, setViewed] = useState<string[]>(["p1", "p7"]);

  // Demo: simulated push notification stream
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotifications((n) => [
        {
          id: "auto-" + Date.now(),
          type: "promo",
          title: "Flash sale: 20% off local grocery for the next hour",
          titleBn: "ফ্ল্যাশ সেল: পরের এক ঘণ্টা স্থানীয় মুদিতে ২০% ছাড়",
          time: "just now",
        },
        ...n,
      ]);
    }, 20000);
    return () => window.clearTimeout(timer);
  }, []);

  const addToCart = useCallback((productId: string, sellerId: string, qty = 1) => {
    setCart((c) => {
      const found = c.find((l) => l.productId === productId);
      if (found) return c.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty, sellerId } : l));
      return [...c, { productId, sellerId, qty }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.productId !== productId) : c.map((l) => (l.productId === productId ? { ...l, qty } : l))));
  }, []);

  const removeFromCart = useCallback((productId: string) => setCart((c) => c.filter((l) => l.productId !== productId)), []);
  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (productId: string) => setWishlist((w) => (w.includes(productId) ? w.filter((x) => x !== productId) : [...w, productId])),
    [],
  );

  const markViewed = useCallback((productId: string) => {
    setViewed((v) => [productId, ...v.filter((x) => x !== productId)].slice(0, 8));
  }, []);

  const pushNotification = useCallback((n: Omit<AppNotification, "id" | "time">) => {
    setNotifications((list) => [{ ...n, id: "n-" + Date.now(), time: "just now" }, ...list]);
  }, []);

  const placeOrder = useCallback(
    (payment: string, total: number) => {
      const id = "HL-" + Math.floor(2300 + Math.random() * 90);
      const items = cart.map((l) => ({ productId: l.productId, qty: l.qty }));
      const seller = cart[0]?.sellerId ?? "s1";
      setOrders((o) => [{ id, date: "31 Jul 2026", items, total, payment, status: 0, seller }, ...o]);
      setCoins((c) => c + Math.round(total / 50));
      setCart([]);
      pushNotification({
        type: "order",
        title: `Order #${id} confirmed — earning ${Math.round(total / 50)} coins`,
        titleBn: `অর্ডার #${id} নিশ্চিত — ${Math.round(total / 50)} কয়েন যোগ হয়েছে`,
      });
      return id;
    },
    [cart, pushNotification],
  );

  const spendCoins = useCallback((n: number) => {
    let ok = false;
    setCoins((c) => {
      if (c >= n) {
        ok = true;
        return c - n;
      }
      return c;
    });
    return ok;
  }, []);

  const value = useMemo<Store>(
    () => ({
      cart, wishlist, orders, notifications, coins, viewed,
      addToCart, setQty, removeFromCart, clearCart, toggleWishlist, placeOrder, markViewed, pushNotification, spendCoins,
    }),
    [cart, wishlist, orders, notifications, coins, viewed, addToCart, setQty, removeFromCart, clearCart, toggleWishlist, placeOrder, markViewed, pushNotification, spendCoins],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const cartTotal = (cart: CartLine[]) =>
  cart.reduce((sum, l) => {
    const p = products.find((x) => x.id === l.productId);
    const offer = p?.offers.find((o) => o.sellerId === l.sellerId) ?? p?.offers[0];
    return sum + (offer?.price ?? 0) * l.qty;
  }, 0);
