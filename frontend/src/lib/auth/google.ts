/**
 * Thin adapter over Google Identity Services (SRP: script loading + button
 * rendering only). Everything auth-related stays in AuthProvider.
 */
export type GoogleCredentialResponse = { credential?: string };

type GoogleAccountsId = {
  initialize: (config: { client_id: string; callback: (r: GoogleCredentialResponse) => void; ux_mode?: string }) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } };
  }
}

const SRC = "https://accounts.google.com/gsi/client";
let loader: Promise<GoogleAccountsId> | null = null;

/** Singleton loader — the GIS script is injected at most once per page. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in requires a browser"));
  if (loader) return loader;

  loader = new Promise<GoogleAccountsId>((resolve, reject) => {
    const ready = () => {
      const id = window.google?.accounts?.id;
      if (id) resolve(id);
      else reject(new Error("Google Identity Services failed to initialise"));
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) return ready();
      existing.addEventListener("load", ready);
      existing.addEventListener("error", () => reject(new Error("Could not load Google sign-in")));
      return;
    }
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    script.defer = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("Could not load Google sign-in"));
    document.head.appendChild(script);
  });

  return loader;
}
