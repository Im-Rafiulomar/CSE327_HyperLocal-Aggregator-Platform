import { badRequest, unauthorized } from "../../utils/errors.js";

/**
 * Verifies Google Identity Services ID tokens (DIP: AuthService depends on this
 * small interface, not on Google's SDK). Uses Google's public tokeninfo
 * endpoint so no native dependency is required.
 */
export class GoogleIdentityService {
  constructor({ clientId = process.env.GOOGLE_CLIENT_ID, fetchImpl = fetch } = {}) {
    this.clientId = clientId;
    this.fetchImpl = fetchImpl;
  }

  get enabled() {
    return Boolean(this.clientId);
  }

  /** @returns {Promise<{ sub: string, email: string, name: string, picture?: string }>} */
  async verify(credential) {
    if (!this.enabled) throw badRequest("Google sign-in is not configured on the server (set GOOGLE_CLIENT_ID)");
    if (!credential) throw badRequest("Missing Google credential");

    const res = await this.fetchImpl(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!res.ok) throw unauthorized("Invalid Google credential");

    const payload = await res.json();
    const audiences = String(this.clientId).split(",").map((a) => a.trim());
    if (!audiences.includes(payload.aud)) throw unauthorized("Google credential was issued for another app");
    if (!["accounts.google.com", "https://accounts.google.com"].includes(payload.iss)) throw unauthorized("Untrusted issuer");
    if (Number(payload.exp) * 1000 < Date.now()) throw unauthorized("Google credential expired");
    if (payload.email_verified !== "true" && payload.email_verified !== true) throw unauthorized("Google email is not verified");

    return {
      sub: String(payload.sub),
      email: String(payload.email).toLowerCase(),
      name: payload.name || String(payload.email).split("@")[0],
      picture: payload.picture,
    };
  }
}

export const googleIdentityService = new GoogleIdentityService();
