import jwt from "jsonwebtoken";

/**
 * Wraps the JWT library behind an interface the auth service owns (DIP):
 * swapping jsonwebtoken for another signer touches only this class.
 */
export class TokenService {
  constructor(jwtLib = jwt) {
    this.jwt = jwtLib;
  }

  signAccess(user) {
    return this.jwt.sign({ sub: String(user._id), role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });
  }

  signRefresh(user) {
    return this.jwt.sign({ sub: String(user._id), type: "refresh" }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    });
  }

  verifyAccess(token) {
    return this.jwt.verify(token, process.env.JWT_SECRET);
  }

  verifyRefresh(token) {
    return this.jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  }

  get cookieOptions() {
    return {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    };
  }
}

export const tokenService = new TokenService();
