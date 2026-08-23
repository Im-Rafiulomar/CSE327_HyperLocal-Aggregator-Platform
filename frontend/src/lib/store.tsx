import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api";
import { useAuth } from "./auth";

export type CartLine = {
  productId: string;
  productSlug: string;
  productName: string;
  productNameBn?: string;
  productEmoji?: string;
  productImage?: string;
  sellerId: string;
  sellerName: string;
  sellerNameBn?: string;
  delivery?: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  items: {
    productId: string;
    name: string;
    emoji?: string;
    qty: number;
    price: number;
  }[];
  total: number;
  payment: string;
  status: string;
  tracking: { label: string; labelBn: string; done: boolean }[];
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  titleBn: string;
  time: string;
};

type Store = {
  cart: CartLine[];
  wishlist: string[];
  orders: Order[];
  notifications: AppNotification[];
  coins: number;
  viewed: string[];
  addToCart: (productSlug: string, sellerId: string, qty?: number) => Promise<void>;
  setQty: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  placeOrder: (
    paymentMethod: "cod" | "bkash" | "card" | "wallet",
    data: {
      line1: string;
      label?: string;
      area?: string;
      city?: string;
      postcode?: string;
      coinsToUse?: number;
    },
  ) => Promise<string>;
  markViewed: (productSlug: string) => void;
  reload: () => Promise<void>;
};

const Ctx = createContext<Store | null>(null);

function since(iso?: string): string {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.floor(ms / 60000));
  if (min < 60) return `${min} min ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function mapCart(input: unknown): CartLine[] {
  const cart = (input as { items?: unknown[] } | null)?.items ?? [];
  return cart
    .map((raw) => {
      const row = raw as {
        qty?: number;
        seller?: { _id?: string; name?: string; nameBn?: string } | string;
        product?: {
          _id?: string;
          slug?: string;
          name?: string;
          nameBn?: string;
          emoji?: string;
          image?: string;
          offers?: Array<{
            seller?: { _id?: string } | string;
            price?: number;
            delivery?: string;
          }>;
        };
      };
      const product = row.product;
      const seller = row.seller;
      if (!product?._id || !product.slug) return null;
      const sellerId = typeof seller === "string" ? seller : (seller?._id ?? "");
      if (!sellerId) return null;

      const offer = product.offers?.find((o) => {
        const offerSeller = typeof o.seller === "string" ? o.seller : (o.seller?._id ?? "");
        return offerSeller === sellerId;
      });

      return {
        productId: String(product._id),
        productSlug: String(product.slug),
        productName: String(product.name ?? "Product"),
        productNameBn: product.nameBn,
        productEmoji: product.emoji,
        productImage: product.image,
        sellerId,
        sellerName: typeof seller === "string" ? "Seller" : String(seller.name ?? "Seller"),
        sellerNameBn: typeof seller === "string" ? undefined : seller.nameBn,
        delivery: offer?.delivery,
        qty: Math.max(1, Number(row.qty ?? 1)),
        price: Number(offer?.price ?? 0),
      } satisfies CartLine;
    })
    .filter(Boolean) as CartLine[];
}

function mapOrders(input: unknown): Order[] {
  const rows = (input as { items?: unknown[] } | null)?.items ?? [];
  return rows.map((raw) => {
    const row = raw as {
      code?: string;
      createdAt?: string;
      items?: Array<{ product?: string; name?: string; emoji?: string; qty?: number; price?: number }>;
      total?: number;
      paymentMethod?: string;
      status?: string;
      tracking?: Array<{ label?: string; labelBn?: string; done?: boolean }>;
    };

    return {
      id: String(row.code ?? ""),
      date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
      items: (row.items ?? []).map((it) => ({
        productId: String(it.product ?? ""),
        name: String(it.name ?? "Item"),
        emoji: it.emoji,
        qty: Number(it.qty ?? 1),
        price: Number(it.price ?? 0),
      })),
      total: Number(row.total ?? 0),
      payment: String(row.paymentMethod ?? "cod").toUpperCase(),
      status: String(row.status ?? "placed"),
      tracking: (row.tracking ?? []).map((t) => ({
        label: String(t.label ?? ""),
        labelBn: String(t.labelBn ?? ""),
        done: Boolean(t.done),
      })),
    } satisfies Order;
  });
}

function mapNotifications(input: unknown): AppNotification[] {
  const rows = (input as { items?: unknown[] } | null)?.items ?? [];
  return rows.map((raw) => {
    const row = raw as {
      _id?: string;
      type?: string;
      title?: string;
      titleBn?: string;
      createdAt?: string;
    };
    return {
      id: String(row._id ?? ""),
      type: String(row.type ?? "system"),
      title: String(row.title ?? ""),
      titleBn: String(row.titleBn ?? row.title ?? ""),
      time: since(row.createdAt),
    } satisfies AppNotification;
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [coins, setCoins] = useState(0);
  const [viewed, setViewed] = useState<string[]>([]);

  const reload = useCallback(async () => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      setOrders([]);
      setNotifications([]);
      setCoins(0);
      return;
    }

    const [cartRes, ordersRes, notificationsRes, rewardsRes, wishlistRes] =
      await Promise.all([
        api.cart.get(),
        api.orders.list(),
        api.users.notifications(),
        api.rewards.me(),
        api.users.wishlist(),
      ]);

    setCart(mapCart((cartRes as { cart?: unknown }).cart));
    setOrders(mapOrders(ordersRes));
    setNotifications(mapNotifications(notificationsRes));
    setCoins(Number((rewardsRes as { coins?: number }).coins ?? user.coins ?? 0));

    const wishItems = (wishlistRes as { items?: Array<{ _id?: string }> }).items ?? [];
    setWishlist(wishItems.map((p) => String(p._id ?? "")).filter(Boolean));
  }, [user]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addToCart = useCallback(async (productSlug: string, sellerId: string, qty = 1) => {
    const res = await api.cart.add({ productSlug, sellerId, qty });
    setCart(mapCart((res as { cart?: unknown }).cart));
  }, []);

  const setQty = useCallback(
    async (productId: string, qty: number) => {
      const existing = cart.find((line) => line.productId === productId);
      if (!existing) return;
      await api.cart.setQty({ productId, sellerId: existing.sellerId, qty: Math.max(0, qty) });
      if (qty <= 0) {
        setCart((lines) => lines.filter((line) => line.productId !== productId));
        return;
      }
      setCart((lines) =>
        lines.map((line) => (line.productId === productId ? { ...line, qty } : line)),
      );
    },
    [cart],
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      await setQty(productId, 0);
    },
    [setQty],
  );

  const clearCart = useCallback(async () => {
    await api.cart.clear();
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(async (productId: string) => {
    await api.users.toggleWishlist(productId);
    const res = await api.users.wishlist();
    const wishItems = (res as { items?: Array<{ _id?: string }> }).items ?? [];
    setWishlist(wishItems.map((p) => String(p._id ?? "")).filter(Boolean));
  }, []);

  const markViewed = useCallback((productSlug: string) => {
    setViewed((v) => [productSlug, ...v.filter((x) => x !== productSlug)].slice(0, 8));
  }, []);

  const placeOrder = useCallback(
    async (
      paymentMethod: "cod" | "bkash" | "card" | "wallet",
      data: {
        line1: string;
        label?: string;
        area?: string;
        city?: string;
        postcode?: string;
        coinsToUse?: number;
      },
    ) => {
      const res = await api.orders.checkout({
        paymentMethod,
        coinsToUse: data.coinsToUse ?? 0,
        address: {
          line1: data.line1,
          label: data.label,
          area: data.area,
          city: data.city,
          postcode: data.postcode,
        },
      });

      const nextCoins = Number((res as { coins?: number }).coins ?? coins);
      setCoins(nextCoins);
      await reload();

      const order = (res as { order?: { code?: string } }).order;
      return String(order?.code ?? "");
    },
    [coins, reload],
  );

  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      orders,
      notifications,
      coins,
      viewed,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      placeOrder,
      markViewed,
      reload,
    }),
    [
      cart,
      wishlist,
      orders,
      notifications,
      coins,
      viewed,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      placeOrder,
      markViewed,
      reload,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export const cartTotal = (cart: CartLine[]) =>
  cart.reduce((sum, line) => sum + line.price * line.qty, 0);
