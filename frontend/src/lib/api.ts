/**
 * Public API facade for the Express + MongoDB backend (see /server).
 *
 * Structure (SOLID):
 *   lib/http/HttpClient.ts  – transport only, retries a 401 through refresh
 *   lib/http/TokenStore.ts  – single owner of the in-memory access token
 *   lib/api/repositories.ts – one repository per resource
 *   lib/api/client.ts       – composition root wiring them together
 *
 * Set VITE_API_URL in .env, e.g. VITE_API_URL=http://localhost:5000/api
 */
import { apiClient } from "./api/client";
import { tokenStore } from "./http/TokenStore";

export { ApiError } from "./http/ApiError";
export type { ApiUser, Paginated, Session } from "./api/types";
export { apiClient };

export const setAccessToken = (token: string | null) => tokenStore.set(token);
export const getAccessToken = () => tokenStore.get();

/** Backwards-compatible object API — delegates to the repositories. */
export const api = apiClient;
