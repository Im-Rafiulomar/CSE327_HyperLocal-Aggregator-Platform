import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import multer from "multer";
import { badRequest } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Files are written outside src/, next to node_modules, and served statically by index.js. */
export const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");
export const PRODUCT_UPLOAD_DIR = path.join(UPLOAD_ROOT, "products");

fs.mkdirSync(PRODUCT_UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRODUCT_UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype] || path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
    return cb(badRequest("Only JPEG, PNG, WebP or GIF images are allowed"));
  }
  cb(null, true);
};

/** Single "image" field, 5MB cap — matches the limit shown in the upload UI. */
export const uploadProductImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single("image");

/** Normalizes Multer's own errors (wrong field name, file too large) into ApiError so the shared error handler can render them. */
export function handleUploadErrors(err, _req, _res, next) {
  if (!err) return next();
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") return next(badRequest("Image is too large (max 5MB)"));
    return next(badRequest(`Upload failed: ${err.message}`));
  }
  next(err);
}
