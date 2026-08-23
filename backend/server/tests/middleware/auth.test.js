import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/utils/tokens.js", () => ({
  verifyAccessToken: vi.fn(),
}));
vi.mock("../../src/models/User.js", () => ({
  User: { findById: vi.fn() },
}));

const { verifyAccessToken } = await import("../../src/utils/tokens.js");
const { User } = await import("../../src/models/User.js");
const { requireAuth, optionalAuth, requireRole } = await import("../../src/middleware/auth.js");

beforeEach(() => {
  vi.resetAllMocks();
});

function mockReq(authHeader) {
  return { headers: authHeader ? { authorization: authHeader } : {} };
}

describe("requireAuth", () => {
  it("rejects with 401 when no Authorization header is present", async () => {
    const next = vi.fn();
    await requireAuth(mockReq(), {}, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Missing access token");
  });

  it("rejects with 401 when the header does not use the Bearer scheme", async () => {
    const next = vi.fn();
    await requireAuth(mockReq("Basic abc123"), {}, next);

    expect(next.mock.calls[0][0].message).toBe("Missing access token");
  });

  it("rejects with 401 when the token fails verification", async () => {
    verifyAccessToken.mockImplementation(() => {
      throw new Error("bad token");
    });
    const next = vi.fn();

    await requireAuth(mockReq("Bearer badtoken"), {}, next);

    expect(next.mock.calls[0][0].message).toBe("Invalid or expired token");
  });

  it("rejects with 401 when the token is valid but the user no longer exists", async () => {
    verifyAccessToken.mockReturnValue({ sub: "u1" });
    User.findById.mockResolvedValue(null);
    const next = vi.fn();

    await requireAuth(mockReq("Bearer goodtoken"), {}, next);

    expect(next.mock.calls[0][0].message).toBe("User no longer exists");
  });

  it("attaches req.user and calls next() with no error for a valid token", async () => {
    verifyAccessToken.mockReturnValue({ sub: "u1" });
    const fakeUser = { _id: "u1", role: "buyer" };
    User.findById.mockResolvedValue(fakeUser);
    const next = vi.fn();
    const req = mockReq("Bearer goodtoken");

    await requireAuth(req, {}, next);

    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("optionalAuth", () => {
  it("calls next() without setting req.user when there is no Authorization header", async () => {
    const next = vi.fn();
    const req = mockReq();

    await optionalAuth(req, {}, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("silently continues as anonymous when the token is invalid", async () => {
    verifyAccessToken.mockImplementation(() => {
      throw new Error("bad token");
    });
    const next = vi.fn();
    const req = mockReq("Bearer badtoken");

    await optionalAuth(req, {}, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it("attaches req.user when the token is valid", async () => {
    verifyAccessToken.mockReturnValue({ sub: "u1" });
    const fakeUser = { _id: "u1" };
    User.findById.mockResolvedValue(fakeUser);
    const next = vi.fn();
    const req = mockReq("Bearer goodtoken");

    await optionalAuth(req, {}, next);

    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("requireRole", () => {
  it("calls next() with a 403 ApiError when there is no req.user", () => {
    const next = vi.fn();
    requireRole("admin")({}, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(403);
  });

  it("calls next() with a 403 ApiError when the user's role is not allowed", () => {
    const next = vi.fn();
    requireRole("admin", "seller")({ user: { role: "buyer" } }, {}, next);

    expect(next.mock.calls[0][0].status).toBe(403);
  });

  it("calls next() with no error when the user's role is allowed", () => {
    const next = vi.fn();
    requireRole("admin", "seller")({ user: { role: "seller" } }, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("reads the role from req.user, never from client input, e.g. req.body", () => {
    const next = vi.fn();
    // even if a client tried to smuggle a role via the body, requireRole ignores it
    requireRole("admin")({ user: { role: "buyer" }, body: { role: "admin" } }, {}, next);

    expect(next.mock.calls[0][0].status).toBe(403);
  });
});
