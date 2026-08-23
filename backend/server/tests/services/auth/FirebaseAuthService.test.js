import { describe, it, expect, vi } from "vitest";
import { FirebaseAuthService } from "../../../src/services/auth/FirebaseAuthService.js";

const validDecoded = {
  uid: "firebase-uid-123",
  email: "Buyer@Example.com",
  email_verified: true,
  name: "Test Buyer",
  picture: "https://example.com/pic.jpg",
};

function adminAuthReturning(decoded) {
  return { verifyIdToken: vi.fn().mockResolvedValue(decoded) };
}

function adminAuthRejecting(error = new Error("invalid token")) {
  return { verifyIdToken: vi.fn().mockRejectedValue(error) };
}

describe("FirebaseAuthService.enabled", () => {
  it("is false when no admin auth client is configured", () => {
    const svc = new FirebaseAuthService({ adminAuth: null });
    expect(svc.enabled).toBe(false);
  });

  it("is true when an admin auth client is provided", () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning(validDecoded) });
    expect(svc.enabled).toBe(true);
  });
});

describe("FirebaseAuthService.verify", () => {
  it("rejects when Firebase sign-in is not configured", async () => {
    const svc = new FirebaseAuthService({ adminAuth: null });
    await expect(svc.verify("token")).rejects.toThrow(/not configured/);
  });

  it("rejects when no ID token is given", async () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning(validDecoded) });
    await expect(svc.verify()).rejects.toThrow(/Missing Firebase credential/);
  });

  it("rejects when the Admin SDK fails to verify the token (bad signature/expired/revoked)", async () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthRejecting() });
    await expect(svc.verify("bad-token")).rejects.toThrow(/Invalid or expired Firebase credential/);
  });

  it("checks token revocation by calling verifyIdToken with checkRevoked=true", async () => {
    const adminAuth = adminAuthReturning(validDecoded);
    const svc = new FirebaseAuthService({ adminAuth });

    await svc.verify("good-token");

    expect(adminAuth.verifyIdToken).toHaveBeenCalledWith("good-token", true);
  });

  it("rejects an unverified email", async () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning({ ...validDecoded, email_verified: false }) });
    await expect(svc.verify("token")).rejects.toThrow(/not verified/);
  });

  it("returns a normalized profile for a fully valid token", async () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning(validDecoded) });
    const profile = await svc.verify("good-token");

    expect(profile).toEqual({
      sub: "firebase-uid-123",
      email: "buyer@example.com", // lowercased
      name: "Test Buyer",
      picture: "https://example.com/pic.jpg",
    });
  });

  it("falls back to the lowercased email's local part when name is missing", async () => {
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning({ ...validDecoded, name: undefined }) });
    const profile = await svc.verify("token");
    expect(profile.name).toBe("buyer");
  });

  it("falls back to 'User' when both name and email are missing", async () => {
    const decoded = { uid: "u2", email_verified: true, name: undefined, email: undefined };
    const svc = new FirebaseAuthService({ adminAuth: adminAuthReturning(decoded) });
    const profile = await svc.verify("token");
    expect(profile.name).toBe("User");
    expect(profile.email).toBe("");
  });
});
