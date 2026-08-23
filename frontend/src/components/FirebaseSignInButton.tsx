import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  envConfig,
  hasEnvConfig,
  signInWithGooglePopup,
  type FirebaseWebConfig,
} from "@/lib/auth/firebase";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  /** role used only when the Firebase account is brand new */
  role?: "buyer" | "seller";
  shopName?: string | undefined;
  area?: string | undefined;
  onSuccess?: () => void;
  text?: "signin_with" | "signup_with" | "continue_with";
};

const LABELS: Record<NonNullable<Props["text"]>, string> = {
  signin_with: "Sign in with Google",
  signup_with: "Sign up with Google",
  continue_with: "Continue with Google",
};

/** Signs in via Firebase Auth's Google popup, then exchanges the ID token for an API session. */
export function FirebaseSignInButton({
  role = "buyer",
  shopName,
  area,
  onSuccess,
  text = "signin_with",
}: Props) {
  const { loginWithFirebase } = useAuth();
  const [config, setConfig] = useState<FirebaseWebConfig | null>(
    hasEnvConfig() ? envConfig() : null,
  );
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // fall back to fetching the public web config from the API when no build-time env vars are set
  useEffect(() => {
    if (config) return;
    let cancelled = false;
    api.auth
      .firebaseConfig()
      .then((res) => {
        if (cancelled) return;
        if (res.apiKey && res.authDomain && res.projectId && res.appId)
          setConfig(res);
        else setUnavailable(true);
      })
      .catch(() => !cancelled && setUnavailable(true));
    return () => {
      cancelled = true;
    };
  }, [config]);

  async function handleClick() {
    if (!config) return;
    setError(null);
    setBusy(true);
    try {
      const idToken = await signInWithGooglePopup(config);
      await loginWithFirebase({ idToken, role, shopName, area });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  if (unavailable) {
    return (
      <p className="text-center text-[11px] text-muted-foreground">
        Google sign-in is not configured. Set{" "}
        <code className="font-mono">FIREBASE_*</code> env vars on the API
        server.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={!config || busy}
        onClick={handleClick}
        className="w-full"
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 34.9 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.2 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C39.7 37 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
        )}
        {busy ? "Signing in…" : LABELS[text]}
      </Button>
      {error && (
        <p role="alert" className="text-center text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
