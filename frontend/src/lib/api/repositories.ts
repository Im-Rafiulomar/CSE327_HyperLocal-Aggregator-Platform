import { BaseRepository } from "./BaseRepository";
import type { ApiProduct, ApiUser, ListingInput, Paginated, SellerProfile, Session, VisionResult, VoiceResult } from "./types";

export class AuthRepository extends BaseRepository {
  register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    role?: "buyer" | "seller" | undefined;
    shopName?: string | undefined;
    area?: string | undefined;
  }) {
    return this.http.post<Session>("/auth/register", data);
  }

  login(data: { email: string; password: string }) {
    return this.http.post<Session>("/auth/login", data);
  }

  googleConfig() {
    return this.http.get<{ clientId: string | null }>("/auth/google/config");
  }

  loginWithGoogle(data: {
    credential: string;
    role?: "buyer" | "seller" | undefined;
    shopName?: string | undefined;
    area?: string | undefined;
  }) {
    return this.http.post<Session>("/auth/google", data);
  }

  refresh() {
    return this.http.post<Session>("/auth/refresh");
  }

  logout() {
    return this.http.post<{ ok: true }>("/auth/logout");
  }

  me() {
    return this.http.get<{ user: ApiUser; sellerProfile: SellerProfile | null }>("/auth/me");
  }
}

export class ProductRepository extends BaseRepository {
  list(params: Record<string, string | number | undefined> = {}) {
    return this.http.get<Paginated<unknown>>(`/products?${this.qs(params)}`);
  }

  detail(slug: string) {
    return this.http.get<{ product: unknown; reviews: unknown[]; aiSummary: string; flaggedCount: number }>(
      `/products/${slug}`,
    );
  }

  recommendations() {
    return this.http.get<{ items: unknown[] }>("/products/recommendations");
  }

  updateOffer(slug: string, data: { price: number; stock: number; delivery?: string }) {
    return this.http.patch(`/products/${slug}/offer`, data);
  }
}

export class ReviewRepository extends BaseRepository {
  create(data: { productSlug: string; rating: number; text: string }) {
    return this.http.post("/reviews", data);
  }

  remove(id: string) {
    return this.http.delete(`/reviews/${id}`);
  }
}

export class CartRepository extends BaseRepository {
  get() {
    return this.http.get<{ cart: unknown }>("/cart");
  }

  add(data: { productSlug: string; sellerId: string; qty?: number }) {
    return this.http.post("/cart/items", data);
  }

  setQty(data: { productId: string; sellerId: string; qty: number }) {
    return this.http.patch("/cart/items", data);
  }

  clear() {
    return this.http.delete("/cart");
  }
}

export class OrderRepository extends BaseRepository {
  list() {
    return this.http.get<{ items: unknown[] }>("/orders");
  }

  detail(code: string) {
    return this.http.get<{ order: unknown }>(`/orders/${code}`);
  }

  checkout(data: {
    paymentMethod: "cod" | "bkash" | "card" | "wallet";
    coinsToUse?: number;
    address: { line1: string; label?: string; area?: string; city?: string; postcode?: string };
  }) {
    return this.http.post<{ order: unknown; coins: number }>("/orders/checkout", data);
  }

  setStatus(code: string, status: string) {
    return this.http.patch(`/orders/${code}/status`, { status });
  }
}

export class UserRepository extends BaseRepository {
  updateProfile(data: Partial<ApiUser>) {
    return this.http.patch<{ user: ApiUser }>("/users/me", data);
  }

  addAddress(data: { line1: string; label?: string; area?: string; city?: string; isDefault?: boolean }) {
    return this.http.post("/users/me/addresses", data);
  }

  removeAddress(id: string) {
    return this.http.delete(`/users/me/addresses/${id}`);
  }

  wishlist() {
    return this.http.get<{ items: unknown[] }>("/users/me/wishlist");
  }

  toggleWishlist(productId: string) {
    return this.http.post<{ saved: boolean }>(`/users/me/wishlist/${productId}`);
  }

  notifications() {
    return this.http.get<{ items: unknown[] }>("/users/me/notifications");
  }

  markNotificationsRead() {
    return this.http.post("/users/me/notifications/read");
  }
}

export class RewardRepository extends BaseRepository {
  coupons() {
    return this.http.get<{ items: unknown[] }>("/rewards/coupons");
  }

  me() {
    return this.http.get<{ coins: number; tier: string; coinsToNextTier: number }>("/rewards/me");
  }

  redeem(code: string) {
    return this.http.post<{ coins: number }>(`/rewards/redeem/${code}`);
  }
}

export class SellerRepository extends BaseRepository {
  list() {
    return this.http.get<{ items: unknown[] }>("/sellers");
  }

  detail(slug: string) {
    return this.http.get<{ seller: unknown; listings: unknown[] }>(`/sellers/${slug}`);
  }

  dashboard() {
    return this.http.get<{ metrics: Record<string, number>; listings: unknown[]; insights: unknown[] }>(
      "/sellers/me/dashboard",
    );
  }

  orders() {
    return this.http.get<{ items: unknown[] }>("/sellers/me/orders");
  }

  /** Seller-owned catalogue management. */
  myProfile() {
    return this.http.get<{ seller: SellerProfile; listings: ApiProduct[] }>("/sellers/me/profile");
  }

  updateMyProfile(data: Partial<Pick<SellerProfile, "name" | "nameBn" | "area" | "responseTime">>) {
    return this.http.patch<{ seller: SellerProfile }>("/sellers/me/profile", data);
  }

  myProducts() {
    return this.http.get<{ items: ApiProduct[] }>("/sellers/me/products");
  }

  createProduct(data: ListingInput) {
    return this.http.post<{ product: ApiProduct }>("/sellers/me/products", data);
  }

  updateProduct(slug: string, data: Partial<ListingInput>) {
    return this.http.patch<{ product: ApiProduct }>(`/sellers/me/products/${slug}`, data);
  }

  deleteProduct(slug: string) {
    return this.http.delete<{ removed: boolean; productDeleted: boolean }>(`/sellers/me/products/${slug}`);
  }
}

export class AiRepository extends BaseRepository {
  assistant(message: string) {
    return this.http.post<{ intent: string; reply: string; data?: unknown }>("/ai/assistant", { message });
  }

  status() {
    return this.http.get<{ aiEnabled: boolean }>("/ai/status");
  }

  /** AI image product detection — pass a base64 data URL from the camera. */
  imageSearch(input: { image?: string; labels?: string[]; limit?: number }) {
    return this.http.post<VisionResult>("/ai/image-search", input);
  }

  visualSearch(labels: string[]) {
    return this.http.post<VisionResult>("/ai/visual-search", { labels });
  }

  /** AI voice search — send recorded audio, or a Web Speech transcript. */
  voiceSearch(input: { audio?: string; mimeType?: string; language?: string; transcript?: string }) {
    return this.http.post<VoiceResult>("/ai/voice-search", input);
  }
}
