import express from "express";
import { z } from "zod";
import { Seller } from "../models/Seller.js";
import { Product } from "../models/Product.js";
import { Order } from "../models/Order.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { sellerCatalogService } from "../services/seller/SellerCatalogService.js";
import { asyncHandler, notFound } from "../utils/errors.js";

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ items: await Seller.find().lean() });
  }),
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const seller = await Seller.findOne({ slug: req.params.slug }).lean();
    if (!seller) throw notFound("Seller not found");
    const listings = await Product.find({ "offers.seller": seller._id }).lean();
    res.json({ seller, listings });
  }),
);

/** Seller dashboard: metrics + rule-based AI decision support. */
router.get(
  "/me/dashboard",
  requireAuth,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const sellerId = req.user.seller;
    if (!sellerId) throw notFound("No seller profile linked to this account");

    const seller = await Seller.findById(sellerId).lean();
    const listings = await Product.find({ "offers.seller": sellerId }).lean();
    const orders = await Order.find({ "items.seller": sellerId }).lean();

    const myItems = orders.flatMap((o) => o.items.filter((i) => String(i.seller) === String(sellerId)));
    const revenue = myItems.reduce((s, i) => s + i.price * i.qty, 0);
    const delivered = orders.filter((o) => o.status === "delivered").length;

    const insights = [];
    for (const p of listings) {
      const mine = p.offers.find((o) => String(o.seller) === String(sellerId));
      const cheapest = Math.min(...p.offers.map((o) => o.price));
      if (mine && mine.price > cheapest) {
        insights.push({
          tag: "Pricing",
          text: `${p.name} is ৳${mine.price - cheapest} above the lowest offer. Matching it would win more local orders.`,
        });
      }
      if (mine && mine.stock <= 5) {
        insights.push({ tag: "Stock", text: `${p.name} has only ${mine.stock} left — restock soon.` });
      }
      if (!p.nameBn) {
        insights.push({ tag: "Visibility", text: `Add a Bangla title for ${p.name} to reach more buyers.` });
      }
    }

    res.json({
      seller,
      listings,
      metrics: {
        revenue,
        orders: orders.length,
        unitsSold: myItems.reduce((s, i) => s + i.qty, 0),
        onTimeRate: orders.length ? Math.round((delivered / orders.length) * 100) : 0,
        rating: seller?.rating ?? 0,
      },
      insights: insights.slice(0, 6),
    });
  }),
);

router.get(
  "/me/orders",
  requireAuth,
  requireRole("seller", "admin"),
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ "items.seller": req.user.seller }).sort({ createdAt: -1 }).lean();
    res.json({ items: orders });
  }),
);

/* ---------------------------------------------------------------------------
 * Seller catalogue management — thin controllers over SellerCatalogService.
 * ------------------------------------------------------------------------- */

const sellerOnly = [requireAuth, requireRole("seller", "admin")];

const listingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  nameBn: z.string().trim().max(120).optional(),
  brand: z.string().trim().max(60).optional(),
  category: z.string().trim().min(2).max(40),
  description: z.string().trim().max(2000).optional(),
  descriptionBn: z.string().trim().max(2000).optional(),
  image: z.string().trim().max(500).optional(),
  emoji: z.string().trim().max(8).optional(),
  price: z.number().min(1).max(10_000_000),
  oldPrice: z.number().min(1).max(10_000_000).optional(),
  stock: z.number().int().min(0).max(100000).default(0),
  delivery: z.string().trim().max(40).optional(),
  tags: z.array(z.string().trim().max(30)).max(12).optional(),
  attachToSlug: z.string().trim().max(80).optional(),
});

const patchSchema = listingSchema.partial().omit({ attachToSlug: true });

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  nameBn: z.string().trim().max(80).optional(),
  area: z.string().trim().max(120).optional(),
  responseTime: z.string().trim().max(40).optional(),
});

router.get(
  "/me/profile",
  ...sellerOnly,
  asyncHandler(async (req, res) => {
    const seller = await sellerCatalogService.requireSellerProfile(req.user);
    res.json({ seller, listings: await sellerCatalogService.listMine(req.user) });
  }),
);

router.patch(
  "/me/profile",
  ...sellerOnly,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    res.json({ seller: await sellerCatalogService.updateProfile(req.user, req.body) });
  }),
);

router.get(
  "/me/products",
  ...sellerOnly,
  asyncHandler(async (req, res) => {
    res.json({ items: await sellerCatalogService.listMine(req.user) });
  }),
);

router.post(
  "/me/products",
  ...sellerOnly,
  validate(listingSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json({ product: await sellerCatalogService.createListing(req.user, req.body) });
  }),
);

router.patch(
  "/me/products/:slug",
  ...sellerOnly,
  validate(patchSchema),
  asyncHandler(async (req, res) => {
    res.json({ product: await sellerCatalogService.updateListing(req.user, req.params.slug, req.body) });
  }),
);

router.delete(
  "/me/products/:slug",
  ...sellerOnly,
  asyncHandler(async (req, res) => {
    res.json(await sellerCatalogService.removeListing(req.user, req.params.slug));
  }),
);

export default router;

