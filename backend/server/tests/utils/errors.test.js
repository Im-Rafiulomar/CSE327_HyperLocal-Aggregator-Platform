import { describe, it, expect, vi } from "vitest";
import { ApiError, badRequest, unauthorized, forbidden, notFound, asyncHandler } from "../../src/utils/errors.js";

describe("ApiError factory helpers", () => {
  it("badRequest builds a 400 ApiError with message and details", () => {
    const err = badRequest("bad input", { field: "email" });
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.message).toBe("bad input");
    expect(err.details).toEqual({ field: "email" });
  });

  it("unauthorized defaults to 'Unauthorized' with status 401", () => {
    const err = unauthorized();
    expect(err.status).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });

  it("unauthorized accepts a custom message", () => {
    expect(unauthorized("Missing token").message).toBe("Missing token");
  });

  it("forbidden defaults to 'Forbidden' with status 403", () => {
    const err = forbidden();
    expect(err.status).toBe(403);
    expect(err.message).toBe("Forbidden");
  });

  it("notFound defaults to 'Not found' with status 404", () => {
    const err = notFound();
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
  });
});

describe("asyncHandler", () => {
  it("calls the wrapped handler with req, res, next", async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    const wrapped = asyncHandler(handler);
    const req = {};
    const res = {};
    const next = vi.fn();

    await wrapped(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
  });

  it("propagates a synchronous throw directly (not via next) since it happens before the promise wrapping", async () => {
    // fn(req, res, next) is evaluated as an argument to Promise.resolve(), so a
    // *synchronous* throw inside fn happens before there is any promise to
    // .catch() — it escapes the wrapper immediately instead of reaching next().
    // Handlers should stick to `async` functions (or return rejected promises)
    // so unexpected errors are actually caught and forwarded to next().
    const boom = new Error("sync boom");
    const handler = vi.fn(() => {
      throw boom;
    });
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await expect(async () => wrapped({}, {}, next)).rejects.toThrow("sync boom");
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a rejected promise to next()", async () => {
    const boom = new Error("async boom");
    const handler = vi.fn().mockRejectedValue(boom);
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await wrapped({}, {}, next);

    expect(next).toHaveBeenCalledWith(boom);
  });

  it("does not call next() when the handler resolves successfully", async () => {
    const handler = vi.fn().mockResolvedValue("ok");
    const wrapped = asyncHandler(handler);
    const next = vi.fn();

    await wrapped({}, {}, next);

    expect(next).not.toHaveBeenCalled();
  });
});
