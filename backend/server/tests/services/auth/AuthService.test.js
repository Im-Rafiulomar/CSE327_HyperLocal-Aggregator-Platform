import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../../../src/services/auth/AuthService.js";

function makeUser(overrides = {}) {
  return {
    _id: "u1",
    name: "Test User",
    role: "buyer",
    refreshTokens: [],
    save: vi.fn().mockResolvedValue(undefined),
    comparePassword: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

function makeDeps({ userOverrides = {} } = {}) {
  const user = makeUser(userOverrides);
  return {
    users: {
      exists: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue(user),
      findByEmailWithSecrets: vi.fn().mockResolvedValue(user),
      findByIdWithTokens: vi.fn().mockResolvedValue(user),
      findByRefreshToken: vi.fn().mockResolvedValue(user),
    },
    tokens: {
      signAccess: vi.fn(() => "access-token"),
      signRefresh: vi.fn(() => "refresh-token"),
      verifyRefresh: vi.fn(() => ({ sub: "u1" })),
    },
    sellerFactory: { createFor: vi.fn().mockResolvedValue({ _id: "seller1" }) },
    firebase: { verify: vi.fn() },
    user,
  };
}

describe("AuthService.register", () => {
  it("rejects when an account with the email already exists", async () => {
    const deps = makeDeps();
    deps.users.exists.mockResolvedValue(true);
    const service = new AuthService(deps);

    await expect(service.register({ email: "taken@example.com" })).rejects.toThrow(/already exists/);
    expect(deps.users.create).not.toHaveBeenCalled();
  });

  it("creates a buyer without provisioning a seller profile", async () => {
    const deps = makeDeps();
    const service = new AuthService(deps);

    const result = await service.register({ name: "A", email: "a@example.com", password: "pw", role: "buyer" });

    expect(deps.sellerFactory.createFor).not.toHaveBeenCalled();
    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(deps.user.refreshTokens).toEqual(["refresh-token"]);
    expect(deps.user.save).toHaveBeenCalled();
  });

  it("provisions a seller profile and links it when role is 'seller'", async () => {
    const deps = makeDeps();
    const service = new AuthService(deps);

    const user = await service.register({ name: "Shop", email: "s@example.com", role: "seller", shopName: "My Shop" });

    expect(deps.sellerFactory.createFor).toHaveBeenCalledWith(deps.user, { shopName: "My Shop", area: undefined });
    expect(deps.user.seller).toBe("seller1");
    expect(user.accessToken).toBe("access-token");
  });
});

describe("AuthService.login", () => {
  it("throws the same unauthorized error for an unknown email (no account enumeration)", async () => {
    const deps = makeDeps();
    deps.users.findByEmailWithSecrets.mockResolvedValue(null);
    const service = new AuthService(deps);

    await expect(service.login({ email: "nobody@example.com", password: "x" })).rejects.toThrow(
      "Invalid email or password",
    );
  });

  it("throws the same unauthorized error for a wrong password", async () => {
    const deps = makeDeps({ userOverrides: { comparePassword: vi.fn().mockResolvedValue(false) } });
    const service = new AuthService(deps);

    await expect(service.login({ email: "a@example.com", password: "wrong" })).rejects.toThrow(
      "Invalid email or password",
    );
  });

  it("issues a new session and appends the refresh token, keeping at most 5", async () => {
    const existing = Array.from({ length: 5 }, (_, i) => `old-${i}`);
    const deps = makeDeps({ userOverrides: { refreshTokens: existing } });
    const service = new AuthService(deps);

    const result = await service.login({ email: "a@example.com", password: "correct" });

    expect(deps.user.refreshTokens).toHaveLength(5);
    expect(deps.user.refreshTokens.at(-1)).toBe("refresh-token");
    expect(deps.user.refreshTokens).not.toContain("old-0"); // oldest dropped
    expect(result.accessToken).toBe("access-token");
  });
});

describe("AuthService.loginWithFirebase", () => {
  it("creates a new buyer account when no user exists for the verified email", async () => {
    const deps = makeDeps();
    deps.users.findByEmailWithSecrets.mockResolvedValue(null);
    deps.firebase.verify.mockResolvedValue({ sub: "fb1", email: "new@example.com", name: "New User" });
    const service = new AuthService(deps);

    await service.loginWithFirebase({ idToken: "cred" });

    expect(deps.users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", authProvider: "firebase", firebaseUid: "fb1", coins: 100 }),
    );
  });

  it("creates a seller account and provisions a seller profile when role is 'seller'", async () => {
    const deps = makeDeps();
    deps.users.findByEmailWithSecrets.mockResolvedValue(null);
    const created = makeUser({ role: "seller" });
    deps.users.create.mockResolvedValue(created);
    deps.firebase.verify.mockResolvedValue({ sub: "fb1", email: "seller@example.com", name: "New Seller" });
    const service = new AuthService(deps);

    await service.loginWithFirebase({ idToken: "cred", role: "seller", shopName: "Shop" });

    expect(deps.sellerFactory.createFor).toHaveBeenCalledWith(created, { shopName: "Shop", area: undefined });
  });

  it("links the Firebase identity to an existing local account without creating a duplicate", async () => {
    const deps = makeDeps({ userOverrides: { firebaseUid: undefined } });
    deps.firebase.verify.mockResolvedValue({ sub: "fb99", email: "a@example.com", name: "A" });
    const service = new AuthService(deps);

    await service.loginWithFirebase({ idToken: "cred" });

    expect(deps.users.create).not.toHaveBeenCalled();
    expect(deps.user.firebaseUid).toBe("fb99");
  });

  it("does not overwrite an already-linked firebaseUid", async () => {
    const deps = makeDeps({ userOverrides: { firebaseUid: "existing-fb-uid" } });
    deps.firebase.verify.mockResolvedValue({ sub: "fb99", email: "a@example.com", name: "A" });
    const service = new AuthService(deps);

    await service.loginWithFirebase({ idToken: "cred" });

    expect(deps.user.firebaseUid).toBe("existing-fb-uid");
  });
});

describe("AuthService.refresh", () => {
  it("throws when no token is provided", async () => {
    const deps = makeDeps();
    const service = new AuthService(deps);
    await expect(service.refresh()).rejects.toThrow("Missing refresh token");
  });

  it("throws when the token fails verification", async () => {
    const deps = makeDeps();
    deps.tokens.verifyRefresh.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const service = new AuthService(deps);

    await expect(service.refresh("garbage")).rejects.toThrow("Invalid refresh token");
  });

  it("throws when the token is valid but not present in the user's active token list (revoked)", async () => {
    const deps = makeDeps({ userOverrides: { refreshTokens: ["some-other-token"] } });
    const service = new AuthService(deps);

    await expect(service.refresh("old-token")).rejects.toThrow("Refresh token revoked");
  });

  it("rotates the refresh token: removes the old one, appends the new one", async () => {
    const deps = makeDeps({ userOverrides: { refreshTokens: ["old-token"] } });
    const service = new AuthService(deps);

    await service.refresh("old-token");

    expect(deps.user.refreshTokens).toEqual(["refresh-token"]);
  });
});

describe("AuthService.logout", () => {
  it("does nothing when no token is provided", async () => {
    const deps = makeDeps();
    const service = new AuthService(deps);
    await service.logout();
    expect(deps.users.findByRefreshToken).not.toHaveBeenCalled();
  });

  it("does nothing when the token does not belong to any user", async () => {
    const deps = makeDeps();
    deps.users.findByRefreshToken.mockResolvedValue(null);
    const service = new AuthService(deps);

    await expect(service.logout("token")).resolves.toBeUndefined();
  });

  it("removes the token from the user's active refresh token list", async () => {
    const deps = makeDeps({ userOverrides: { refreshTokens: ["keep-me", "remove-me"] } });
    const service = new AuthService(deps);

    await service.logout("remove-me");

    expect(deps.user.refreshTokens).toEqual(["keep-me"]);
    expect(deps.user.save).toHaveBeenCalled();
  });
});
