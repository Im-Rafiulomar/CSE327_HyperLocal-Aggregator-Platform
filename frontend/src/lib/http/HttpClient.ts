import { ApiError } from "./ApiError";
import { tokenStore, type TokenStore } from "./TokenStore";

/**
 * Transport layer only (SRP): builds requests, attaches the bearer token and
 * maps failures to ApiError. Business/domain code depends on this interface,
 * not on `fetch` (DIP), so it can be faked in tests.
 */
export interface HttpClientOptions {
  baseUrl: string;
  tokens?: TokenStore;
  /** Decorator hook: called once on a 401 to try to renew the session. */
  onUnauthorized?: (client: HttpClient, path: string) => Promise<boolean>;
}

export class HttpClient {
  private baseUrl: string;
  private tokens: TokenStore;
  private onUnauthorized: HttpClientOptions["onUnauthorized"] | undefined;

  constructor({ baseUrl, tokens = tokenStore, onUnauthorized }: HttpClientOptions) {
    this.baseUrl = baseUrl;
    this.tokens = tokens;
    this.onUnauthorized = onUnauthorized;
  }

  async send<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.tokens.get();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : {};
    if (!res.ok) throw new ApiError(res.status, body.error ?? res.statusText, body.details);
    return body as T;
  }

  /** Retries once through the refresh hook when the session expired. */
  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    try {
      return await this.send<T>(path, init);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401 && this.onUnauthorized) {
        const renewed = await this.onUnauthorized(this, path);
        if (renewed) return this.send<T>(path, init);
      }
      throw err;
    }
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, body === undefined ? { method: "POST" } : { method: "POST", body: JSON.stringify(body) });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(
      path,
      body === undefined ? { method: "PATCH" } : { method: "PATCH", body: JSON.stringify(body) },
    );
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}
