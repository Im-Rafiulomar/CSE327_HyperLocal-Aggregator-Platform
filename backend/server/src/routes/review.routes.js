import express from "express";
import { z } from "zod";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, notFound, forbidden } from "../utils/errors.js";
import { analyzeReview } from "../services/fakeReview.js";

const router = express.Router();

const createSchema = z.object({
  productSlug: z.string().trim().min(1),
  rating: z.coerce.number().min(1).max(5),
  text: z.string().trim().min(3).max(2000),
});

router.post(
  "/",
  requireAuth,
  validate(createSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.body.productSlug });
    if (!product) throw notFound("Product not found");

    const historyCount = await Review.countDocuments({ user: req.user._id });
    const verdict = analyzeReview({
      text: req.body.text,
      rating: req.body.rating,
      authorName: req.user.name,
      historyCount,
    });

    const review = await Review.create({
      product: product._id,
      user: req.user._id,
      authorName: req.user.name,
      rating: req.body.rating,
      text: req.body.text,
      ...verdict,
    });

    // ratings recomputed from genuine reviews only
    const genuine = await Review.find({ product: product._id, suspicious: false }).lean();
    product.reviewCount = genuine.length;
    product.rating = genuine.length ? Number((genuine.reduce((s, r) => s + r.rating, 0) / genuine.length).toFixed(2)) : 0;
    await product.save();

    res.status(201).json({ review });
  }),
);

router.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const review = await Review.findById(req.params.id);
    if (!review) throw notFound("Review not found");
    if (String(review.user) !== String(req.user._id) && req.user.role !== "admin") throw forbidden();
    await review.deleteOne();
    res.json({ ok: true });
  }),
);

export default router;
