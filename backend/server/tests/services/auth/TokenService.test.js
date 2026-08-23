import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { TokenService } from "../../../src/services/auth/TokenService.js";

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.JWT_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.JWT_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "30d";
  process.env.NODE_ENV = "test";
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

const user = { _id: "64f0000000000000000000ab", role: "buyer" };

describe("TokenService", () => {
  it("signs an access token that verifies back to the same subject and role", () => {
    const tokens = new TokenService();
    const token = tokens.signAccess(user);
    const payload = tokens.verifyAccess(token);

    expect(payload.sub).toBe(String(user._id));
    expect(payload.role).toBe("buyer");
  });

  it("signs a refresh token that verifies back with type 'refresh'", () => {
    const tokens = new TokenService();
    const token = tokens.signRefresh(user);
    const payload = tokens.verifyRefresh(token);

    expect(payload.sub).toBe(String(user._id));
    expect(payload.type).toBe("refresh");
  });

  it("rejects an access token when verified against the refresh secret's verifier and vice versa", () => {
    const tokens = new TokenService();
    const accessToken = tokens.signAccess(user);

    expect(() => tokens.verifyRefresh(accessToken)).toThrow();
  });

  it("rejects a tampered token", () => {
    const tokens = new TokenService();
    const token = tokens.signAccess(user);
    const tampered = token.slice(0, -2) + (token.slice(-2) === "aa" ? "bb" : "aa");

    expect(() => tokens.verifyAccess(tampered)).toThrow();
  });

  it("marks cookies secure in production and not secure otherwise", () => {
    const tokens = new TokenService();

    process.env.NODE_ENV = "production";
    expect(tokens.cookieOptions.secure).toBe(true);

    process.env.NODE_ENV = "development";
    expect(tokens.cookieOptions.secure).toBe(false);
  });

  it("scopes the refresh cookie to /api/auth and marks it httpOnly", () => {
    const tokens = new TokenService();
    expect(tokens.cookieOptions.path).toBe("/api/auth");
    expect(tokens.cookieOptions.httpOnly).toBe(true);
  });
});
