/**
 * Thin adapter over the Firebase Web SDK (SRP: app init + popup sign-in
 * only). Everything auth-session-related stays in AuthProvider — this
 * module never touches React state or the backend session.
 */
import {
  initializeApp,
  getApps,
  type FirebaseApp,
  type FirebaseOptions,
} from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type Auth,
} from "firebase/auth";

export type FirebaseWebConfig = {
  apiKey: string | null;
  authDomain: string | null;
  projectId: string | null;
  appId: string | null;
};

/** Web config can come from build-time env vars, or be fetched from the API at runtime. */
const ENV_CONFIG: FirebaseWebConfig = {
  apiKey:
    (import.meta.env["VITE_FIREBASE_API_KEY"] as string | undefined) ?? null,
  authDomain:
    (import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] as string | undefined) ??
    null,
  projectId:
    (import.meta.env["VITE_FIREBASE_PROJECT_ID"] as string | undefined) ?? null,
  appId:
    (import.meta.env["VITE_FIREBASE_APP_ID"] as string | undefined) ?? null,
};

export function hasEnvConfig(): boolean {
  return Boolean(
    ENV_CONFIG.apiKey &&
    ENV_CONFIG.authDomain &&
    ENV_CONFIG.projectId &&
    ENV_CONFIG.appId,
  );
}

export function envConfig(): FirebaseWebConfig {
  return ENV_CONFIG;
}

type CompleteFirebaseWebConfig = {
  [K in keyof FirebaseWebConfig]: NonNullable<FirebaseWebConfig[K]>;
};

function isCompleteConfig(
  config: FirebaseWebConfig,
): config is CompleteFirebaseWebConfig {
  return Boolean(
    config.apiKey && config.authDomain && config.projectId && config.appId,
  );
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

/** Initializes the Firebase app at most once (singleton), from whichever config is supplied. */
function getFirebaseAuth(config: FirebaseWebConfig): Auth {
  if (cachedAuth) return cachedAuth;
  if (!isCompleteConfig(config)) {
    throw new Error(
      "Firebase sign-in is not configured (missing apiKey/authDomain/projectId/appId)",
    );
  }

  const options: FirebaseOptions = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
  };

  cachedApp = getApps()[0] ?? initializeApp(options);
  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}

/**
 * Opens the Google popup via Firebase Auth, then returns a fresh Firebase ID
 * token for the signed-in user. The backend verifies this token server-side
 * (POST /auth/firebase) — the client never asserts who it is.
 */
export async function signInWithGooglePopup(
  config: FirebaseWebConfig,
): Promise<string> {
  const auth = getFirebaseAuth(config);
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user.getIdToken();
}

/** Clears the local Firebase Auth session (separate from the backend's httpOnly refresh cookie). */
export async function signOutOfFirebase(): Promise<void> {
  if (!cachedAuth) return;
  await firebaseSignOut(cachedAuth).catch(() => undefined);
}
