import { describe, it, expect, vi } from "vitest";
import { AuthService } from "../../../src/services/auth/AuthService.js";

describe("AuthService", () => {
  it("logs in a user successfully", async () => {
    const firebaseAuth = {
      verify: vi.fn().mockResolvedValue({
        sub: "123",
        email: "user@example.com",
        name: "Test User",
        picture: null
      })
    };

    const users = {
      findOrCreateFromIdentity: vi.fn().mockResolvedValue({
        _id: "user-1",
        email: "user@example.com",
        name: "Test User"
      })
    };

    const tokens = {
      issue: vi.fn().mockResolvedValue({
        accessToken: "test-access-token"
      })
    };

    const service = new AuthService({
      firebaseAuth,
      users,
      tokens
    });

    const result =
      await service.loginWithFirebase("firebase-token");

    expect(firebaseAuth.verify)
      .toHaveBeenCalledWith("firebase-token");

    expect(users.findOrCreateFromIdentity)
      .toHaveBeenCalled();

    expect(tokens.issue)
      .toHaveBeenCalled();

    expect(result.accessToken)
      .toBe("test-access-token");
  });
});