/**
 * Singleton + Observer: one place holds the in-memory access token and
 * notifies subscribers when it changes. Nothing else touches the raw value.
 */
export class TokenStore {
  private token: string | null = null;
  private listeners = new Set<(token: string | null) => void>();

  get(): string | null {
    return this.token;
  }

  set(token: string | null): void {
    this.token = token;
    this.listeners.forEach((l) => l(token));
  }

  subscribe(listener: (token: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const tokenStore = new TokenStore();
