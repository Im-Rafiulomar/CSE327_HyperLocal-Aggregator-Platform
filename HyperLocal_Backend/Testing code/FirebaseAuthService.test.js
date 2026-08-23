import { describe, it, expect, vi } from "vitest";

import {
  FirebaseAuthService
} from "../../../src/services/auth/FirebaseAuthService.js";

describe("FirebaseAuthService", () => {
  it("verifies a Firebase token and normalizes the identity", async () => {
    const adminAuth = {
      verifyIdToken: vi.fn().mockResolvedValue({
        uid: "firebase-123",
        email: "user@example.com",
        name: "Test User",
        picture: "profile.jpg"
      })
    };

    const service =
      new FirebaseAuthService({
        adminAuth
      });

    const result =
      await service.verify("firebase-token");

    expect(adminAuth.verifyIdToken)
      .toHaveBeenCalledWith(
        "firebase-token",
        true
      );

    expect(result).toEqual({
      sub: "firebase-123",
      email: "user@example.com",
      name: "Test User",
      picture: "profile.jpg"
    });
  });
});