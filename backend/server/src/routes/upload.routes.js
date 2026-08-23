import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadProductImage, handleUploadErrors } from "../middleware/upload.js";
import { asyncHandler, badRequest } from "../utils/errors.js";

const router = express.Router();

/**
 * Sellers upload a product photo here and get back a URL to store on the
 * listing's `image` field. Only image/* files under 5MB are accepted
 * (enforced in the multer config); the file is served back from
 * /uploads/products/<filename> (see index.js static mount).
 */
router.post(
  "/products",
  requireAuth,
  requireRole("seller", "admin"),
  uploadProductImage,
  handleUploadErrors,
  asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest("Send an image file in the 'image' field");
    const url = `${req.protocol}://${req.get("host")}/uploads/products/${req.file.filename}`;
    res.status(201).json({ url });
  }),
);

export default router;
