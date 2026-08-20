import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAccessToken, ApiError, type ApiUser } from "./api";
import type { SellerProfile } from "./api/types";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string | undefined;
  role: "buyer" | "seller";
  shopName?: string | undefined;
  area?: string | undefined;
};

export type GoogleLoginInput = {
  credential: string;
  role?: "buyer" | "seller" | undefined;
  shopName?: string | undefined;
  area?: string | undefined;
};

type AuthState = {
  user: ApiUser | null;
  /** the shop record when the signed-in account is a seller */
  sellerProfile: SellerProfile | null;
  loading: boolean;
  /** true when the Express API could not be reached (prototype/offline mode) */
  offline: boolean;
  isSeller: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Google Identity Services sign-in / sign-up */
  loginWithGoogle: (input: GoogleLoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** re-reads the session from the API (after profile edits) */
  reload: () => Promise<void>;
  setUser: (user: ApiUser) => void;
  setSellerProfile: (seller: SellerProfile) => void;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Session provider (single source of truth for auth state).
 * Transport, token storage and refresh live in the HttpClient/TokenStore —
 * this component only owns React state (SRP).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [sellerProfile, setSellerProfileState] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const applySession = useCallback((res: { user: ApiUser; sellerProfile?: SellerProfile | null; accessToken?: string }) => {
    if (res.accessToken) setAccessToken(res.accessToken);
    setUserState(res.user);
    setSellerProfileState(res.sellerProfile ?? null);
    setOffline(false);
  }, []);

  // silent session restore from the httpOnly refresh cookie
  useEffect(() => {
    let cancelled = false;
    api.auth
      .refresh()
      .then((res) => !cancelled && applySession(res))
      .catch((err) => {
        if (cancelled) return;
        // network failure => the API isn't running; auth 401 => simply signed out
        if (!(err instanceof ApiError)) setOffline(true);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      applySession(await api.auth.login({ email, password }));
    },
    [applySession],
  );

  const loginWithGoogle = useCallback<AuthState["loginWithGoogle"]>(
    async (input) => {
      applySession(await api.auth.loginWithGoogle(input));
    },
    [applySession],
  );

  const register = useCallback<AuthState["register"]>(
    async (input) => {
      applySession(await api.auth.register(input));
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    await api.auth.logout().catch(() => undefined);
    setAccessToken(null);
    setUserState(null);
    setSellerProfileState(null);
  }, []);

  const reload = useCallback(async () => {
    const res = await api.auth.me().catch(() => null);
    if (res) applySession(res);
  }, [applySession]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      sellerProfile,
      loading,
      offline,
      isSeller: user?.role === "seller" || user?.role === "admin",
      login,
      loginWithGoogle,
      register,
      logout,
      reload,
      setUser: setUserState,
      setSellerProfile: setSellerProfileState,
    }),
    [user, sellerProfile, loading, offline, login, loginWithGoogle, register, logout, reload],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
