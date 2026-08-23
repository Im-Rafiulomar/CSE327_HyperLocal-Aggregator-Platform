import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { validate, validateQuery } from "../../src/middleware/validate.js";

const bodySchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0),
});

describe("validate", () => {
  it("replaces req.body with the parsed value and calls next() on success", () => {
    const req = { body: { email: "user@example.com", age: 30 } };
    const next = vi.fn();

    validate(bodySchema)(req, {}, next);

    expect(req.body).toEqual({ email: "user@example.com", age: 30 });
    expect(next).toHaveBeenCalledWith(); // called with no error
  });

  it("calls next() with a 400 ApiError containing field errors on failure", () => {
    const req = { body: { email: "not-an-email", age: -1 } };
    const next = vi.fn();

    validate(bodySchema)(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toBe("Validation failed");
    expect(err.details).toHaveProperty("email");
    expect(err.details).toHaveProperty("age");
  });

  it("strips unknown/extra fields not defined in the schema", () => {
    const req = { body: { email: "user@example.com", age: 20, extra: "nope" } };
    const next = vi.fn();

    validate(bodySchema)(req, {}, next);

    expect(req.body).not.toHaveProperty("extra");
  });
});

describe("validateQuery", () => {
  const querySchema = z.object({ page: z.coerce.number().int().min(1).default(1) });

  it("stores the parsed query on req.validatedQuery and calls next()", () => {
    const req = { query: { page: "3" } };
    const next = vi.fn();

    validateQuery(querySchema)(req, {}, next);

    expect(req.validatedQuery).toEqual({ page: 3 });
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() with a 400 ApiError for invalid query params", () => {
    const req = { query: { page: "0" } };
    const next = vi.fn();

    validateQuery(querySchema)(req, {}, next);

    const err = next.mock.calls[0][0];
    expect(err.status).toBe(400);
    expect(err.message).toBe("Invalid query parameters");
  });

  it("does not mutate req.query", () => {
    const req = { query: { page: "2" } };
    const next = vi.fn();

    validateQuery(querySchema)(req, {}, next);

    expect(req.query).toEqual({ page: "2" });
  });
});
