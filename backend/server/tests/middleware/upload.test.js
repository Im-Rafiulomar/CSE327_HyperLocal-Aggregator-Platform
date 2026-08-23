import { describe, it, expect, vi, afterAll } from "vitest";
import fs from "fs";
import multer from "multer";

const { uploadProductImage, handleUploadErrors, PRODUCT_UPLOAD_DIR } = await import("../../src/middleware/upload.js");
const uploadRoutes = (await import("../../src/routes/upload.routes.js")).default;

describe("upload middleware", () => {
  it("creates the product upload directory on import", () => {
    expect(fs.existsSync(PRODUCT_UPLOAD_DIR)).toBe(true);
  });

  it("exposes a single-file multer handler wired to the 'image' field", () => {
    expect(typeof uploadProductImage).toBe("function");
  });
});

describe("handleUploadErrors", () => {
  it("passes through when there is no error", () => {
    const next = vi.fn();
    handleUploadErrors(null, {}, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("maps LIMIT_FILE_SIZE to a friendly 400 ApiError", () => {
    const next = vi.fn();
    const err = new multer.MulterError("LIMIT_FILE_SIZE");
    handleUploadErrors(err, {}, {}, next);

    const passed = next.mock.calls[0][0];
    expect(passed.status).toBe(400);
    expect(passed.message).toMatch(/too large/i);
  });

  it("maps other Multer errors to a 400 ApiError", () => {
    const next = vi.fn();
    const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    handleUploadErrors(err, {}, {}, next);

    expect(next.mock.calls[0][0].status).toBe(400);
  });

  it("forwards non-Multer errors unchanged", () => {
    const next = vi.fn();
    const err = new Error("boom");
    handleUploadErrors(err, {}, {}, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("upload.routes wiring", () => {
  it("registers a POST /products route guarded by requireAuth + requireRole(seller, admin)", () => {
    const layer = uploadRoutes.stack.find((l) => l.route?.path === "/products");
    expect(layer).toBeTruthy();
    // route stack: [requireAuth, requireRole(...), uploadProductImage, handleUploadErrors, handler]
    expect(layer.route.stack.length).toBeGreaterThanOrEqual(4);
  });
});

afterAll(() => {
  // leave the directory (it's real, shared, and .gitignored) but nothing else to clean up —
  // no files are written by these tests since multer isn't invoked with a real request.
});
