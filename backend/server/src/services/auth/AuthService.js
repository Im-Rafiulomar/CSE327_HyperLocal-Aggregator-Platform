import { userRepository } from "../../repositories/index.js";
import { Seller } from "../../models/Seller.js";
import { tokenService } from "./TokenService.js";
import { firebaseAuthService } from "./FirebaseAuthService.js";
import { unauthorized, badRequest } from "../../utils/errors.js";

/** Factory Method: builds the seller profile that a seller account needs. */
export class SellerProfileFactory {
  static async createFor(user, { shopName, area }) {
    const slug = `${(shopName || user.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(user._id).slice(-5)}`;
    return Seller.create({
      slug,
      name: shopName || `${user.name}'s Shop`,
      owner: user._id,
      area: area || "",
      since: String(new Date().getFullYear()),
    });
  }
}

/**
 * All authentication rules live here; routes only translate HTTP <-> service
 * calls (SRP). The service depends on repositories and TokenService, not on
 * Express or Mongoose specifics (DIP).
 */
export class AuthService {
  constructor({ users = userRepository, tokens = tokenService, sellerFactory = SellerProfileFactory, firebase = firebaseAuthService } = {}) {
    this.users = users;
    this.tokens = tokens;
    this.sellerFactory = sellerFactory;
    this.firebase = firebase;
  }

  /** Issues a session for a user document (Template Method shared by every strategy). */
  async issueSession(user) {
    const refreshToken = this.tokens.signRefresh(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();
    return { user, accessToken: this.tokens.signAccess(user), refreshToken };
  }

  /**
   * Firebase Authentication sign-in / sign-up. The ID token (obtained
   * client-side via the Firebase Web SDK — Google, email link, phone, etc.)
   * is verified server-side; the client never decides who it is.
   */
  async loginWithFirebase({ idToken, role = "buyer", shopName, area }) {
    const profile = await this.firebase.verify(idToken);

    let user = await this.users.findByEmailWithSecrets(profile.email);

    if (!user) {
      user = await this.users.create({
        name: profile.name,
        email: profile.email,
        role: role === "seller" ? "seller" : "buyer",
        authProvider: "firebase",
        firebaseUid: profile.sub,
        coins: 100,
      });
      if (user.role === "seller") {
        const seller = await this.sellerFactory.createFor(user, { shopName, area });
        user.seller = seller._id;
      }
    } else if (!user.firebaseUid) {
      // link the Firebase identity to the existing local account
      user.firebaseUid = profile.sub;
    }

    return this.issueSession(user);
  }

  async register({ name, email, password, phone, role, shopName, area }) {
    if (await this.users.exists({ email })) throw badRequest("An account with this email already exists");

    const user = await this.users.create({ name, email, password, phone, role, coins: 100 });

    if (role === "seller") {
      const seller = await this.sellerFactory.createFor(user, { shopName, area });
      user.seller = seller._id;
    }

    const refreshToken = this.tokens.signRefresh(user);
    user.refreshTokens = [refreshToken];
    await user.save();

    return { user, accessToken: this.tokens.signAccess(user), refreshToken };
  }

  async login({ email, password }) {
    const user = await this.users.findByEmailWithSecrets(email);
    // identical message for unknown email and wrong password — no account enumeration
    if (!user || !(await user.comparePassword(password))) throw unauthorized("Invalid email or password");

    const refreshToken = this.tokens.signRefresh(user);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();

    return { user, accessToken: this.tokens.signAccess(user), refreshToken };
  }

  async refresh(token) {
    if (!token) throw unauthorized("Missing refresh token");

    let payload;
    try {
      payload = this.tokens.verifyRefresh(token);
    } catch {
      throw unauthorized("Invalid refresh token");
    }

    const user = await this.users.findByIdWithTokens(payload.sub);
    if (!user || !(user.refreshTokens || []).includes(token)) throw unauthorized("Refresh token revoked");

    const refreshToken = this.tokens.signRefresh(user);
    user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== token).concat(refreshToken);
    await user.save();

    return { user, accessToken: this.tokens.signAccess(user), refreshToken };
  }

  async logout(token) {
    if (!token) return;
    const user = await this.users.findByRefreshToken(token);
    if (!user) return;
    user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== token);
    await user.save();
  }
}

export const authService = new AuthService();
