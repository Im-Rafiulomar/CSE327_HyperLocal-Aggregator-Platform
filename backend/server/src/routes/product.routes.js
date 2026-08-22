import express from "express";
import { z } from "zod";
import { validateQuery } from "../middleware/validate.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { asyncHandler, notFound } from "../utils/errors.js";
import { productRepository, reviewRepository } from "../repositories/index.js";
import { searchService } from "../services/search/SearchService.js";
import { reviewAnalyzer } from "../services/review/ReviewAnalyzer.js";
import { recommendationEngine } from "../services/recommendation/RecommendationEngine.js";

const router = express.Router();

const listQuery = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  maxPrice: z.coerce.number().min(0).max(10_000_000).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  localOnly: z.enum(["true", "false"]).optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc", "rating"]).default("relevance"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(60).default(24),
});

router.get(
  "/",
  validateQuery(listQuery),
  asyncHandler(async (req, res) => {
    res.json(await searchService.search("text", req.validatedQuery));
  }),
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    res.json({ items: await productRepository.categories() });
  }),
);

router.get(
  "/recommendations",
  optionalAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await recommendationEngine.recommend(req.user, 8) });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const product = await productRepository.findBySlug(req.params.slug);
    if (!product) throw notFound("Product not found");

    const reviews = await reviewRepository.forProduct(product._id);
    res.json({
      product,
      reviews,
      aiSummary: reviewAnalyzer.summarize(reviews) || product.aiSummary,
      flaggedCount: reviews.filter((r) => r.suspicious).length,
    });
  }),
);

// seller-owned listing management
const upsertSchema = z.object({
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  delivery: z.string().max(60).optional(),
});

router.patch(
  "/:slug/offer",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = upsertSchema.parse(req.body);
    if (!req.user.seller) throw notFound("You do not have a seller profile");

    const product = await productRepository.findBySlugDocument(req.params.slug);
    if (!product) throw notFound("Product not found");

    const offer = product.offers.find((o) => String(o.seller) === String(req.user.seller));
    if (offer) Object.assign(offer, parsed);
    else product.offers.push({ seller: req.user.seller, ...parsed });

    product.price = Math.min(...product.offers.map((o) => o.price));
    await product.save();
    res.json({ product });
  }),
);

export default router;
