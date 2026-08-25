import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { badRequest, unauthorized } from "../../utils/errors.js";

/**
 * Builds the default Firebase Admin auth client from service-account env vars.
 * Returns null (rather than throwing) when unconfigured, so the app can still
 * boot with Firebase sign-in disabled — mirrors the old GoogleIdentityService.
 */
function buildDefaultAdminAuth() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Service-account private keys are stored as a single env var; the literal
  // "\n" sequences need to become real newlines for the PEM to parse, and quotes stripped if present.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^["']|["']$/g, "")
    ?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) return null;

  const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return getAuth(app);
}

/**
 * Verifies Firebase Authentication ID tokens (DIP: AuthService depends on this
 * small interface, not on the Firebase Admin SDK directly). The ID token is
 * checked server-side via Admin SDK signature/expiry verification — the
 * client never decides who it is.
 */
export class FirebaseAuthService {
  constructor({ adminAuth = buildDefaultAdminAuth() } = {}) {
    this.adminAuth = adminAuth;
  }

  get enabled() {
    return Boolean(this.adminAuth);
  }

  /** @returns {Promise<{ sub: string, email: string, name: string, picture?: string }>} */
  async verify(idToken) {
    if (!this.enabled) {
      throw badRequest("Firebase sign-in is not configured on the server (set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)");
    }
    if (!idToken) throw badRequest("Missing Firebase credential");

    let decoded;
    try {
      // verifyIdToken checks signature, issuer, audience and expiry against
      // the configured project, and rejects revoked tokens with checkRevoked.
      decoded = await this.adminAuth.verifyIdToken(idToken, true);
    } catch (err) {
      // Log the real Admin SDK error — the generic message below is what the
      // user sees, but it fires for very different underlying causes
      // (expired/revoked token, clock skew, wrong project, or a bad/rotated
      // service-account credential that can't even authenticate to Google).
      console.error("[FirebaseAuthService] verifyIdToken failed:", err?.errorInfo?.code || err?.code || err?.message || err);
      throw unauthorized("Invalid or expired Firebase credential");
    }

    if (decoded.email && decoded.email_verified === false) {
      throw unauthorized("Firebase email is not verified");
    }

    const email = String(decoded.email || "").toLowerCase();
    return {
      sub: String(decoded.uid),
      email,
      name: decoded.name || (email ? email.split("@")[0] : "User"),
      picture: decoded.picture,
    };
  }
}

export const firebaseAuthService = new FirebaseAuthService();
