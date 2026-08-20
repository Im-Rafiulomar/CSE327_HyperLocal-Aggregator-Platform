import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { loadGoogleIdentity } from "@/lib/auth/google";
import { useAuth } from "@/lib/auth";

type Props = {
  /** role used only when the Google account is brand new */
  role?: "buyer" | "seller";
  shopName?: string | undefined;
  area?: string | undefined;
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
};

const ENV_CLIENT_ID = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

/** Renders the official Google button and exchanges the ID token for a session. */
export function GoogleSignInButton({ role = "buyer", shopName, area, onSuccess, text = "signin_with" }: Props) {
  const { loginWithGoogle } = useAuth();
  const holder = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(ENV_CLIENT_ID ?? null);
  const [unavailable, setUnavailable] = useState(false);

  // latest props for the GIS callback (which is registered once)
  const latest = useRef({ role, shopName, area, onSuccess });
  latest.current = { role, shopName, area, onSuccess };

  useEffect(() => {
    if (clientId) return;
    let cancelled = false;
    api.auth
      .googleConfig()
      .then((res) => {
        if (cancelled) return;
        if (res.clientId) setClientId(res.clientId);
        else setUnavailable(true);
      })
      .catch(() => !cancelled && setUnavailable(true));
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !holder.current) return;
    let cancelled = false;

    loadGoogleIdentity()
      .then((gis) => {
        if (cancelled || !holder.current) return;
        gis.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) return setError("Google did not return a credential");
            try {
              setError(null);
              await loginWithGoogle({
                credential: response.credential,
                role: latest.current.role,
                shopName: latest.current.shopName,
                area: latest.current.area,
              });
              latest.current.onSuccess?.();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Google sign-in failed");
            }
          },
        });
        holder.current.innerHTML = "";
        gis.renderButton(holder.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text,
          width: 320,
          logo_alignment: "center",
        });
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Google sign-in unavailable"));

    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogle, text]);

  if (unavailable) {
    return (
      <p className="text-center text-[11px] text-muted-foreground">
        Google sign-in is not configured. Set <code className="font-mono">GOOGLE_CLIENT_ID</code> on the API server.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={holder} className="flex justify-center" />
      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
