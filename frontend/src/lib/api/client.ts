import { HttpClient } from "../http/HttpClient";
import { tokenStore } from "../http/TokenStore";
import {
  AiRepository,
  AuthRepository,
  CartRepository,
  OrderRepository,
  ProductRepository,
  RewardRepository,
  ReviewRepository,
  SellerRepository,
  UserRepository,
} from "./repositories";
import type { Session } from "./types";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://localhost:5000/api";

/**
 * Composition root (Facade): wires the transport, the token store and every
 * repository together once. Consumers depend on `apiClient`, never on fetch.
 */
export const http = new HttpClient({
  baseUrl: API_URL,
  tokens: tokenStore,
  onUnauthorized: async (client, path) => {
    if (path.startsWith("/auth")) return false;
    const session = await client.send<Session>("/auth/refresh", { method: "POST" }).catch(() => null);
    if (!session) return false;
    tokenStore.set(session.accessToken);
    return true;
  },
});

export const apiClient = {
  auth: new AuthRepository(http),
  products: new ProductRepository(http),
  reviews: new ReviewRepository(http),
  cart: new CartRepository(http),
  orders: new OrderRepository(http),
  users: new UserRepository(http),
  rewards: new RewardRepository(http),
  sellers: new SellerRepository(http),
  ai: new AiRepository(http),
};
