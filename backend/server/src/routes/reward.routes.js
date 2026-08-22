import express from "express";
import { Coupon } from "../models/Coupon.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, notFound, badRequest } from "../utils/errors.js";

const router = express.Router();

router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    res.json({ items: await Coupon.find({ active: true }).lean() });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const nextTier = 2000;
    res.json({
      coins: req.user.coins,
      claimedCoupons: req.user.claimedCoupons,
      tier: req.user.coins >= nextTier ? "Gold" : "Silver",
      coinsToNextTier: Math.max(0, nextTier - req.user.coins),
    });
  }),
);

router.post(
  "/redeem/:code",
  requireAuth,
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase(), active: true });
    if (!coupon) throw notFound("Coupon not found");
    if (req.user.claimedCoupons.includes(coupon.code)) throw badRequest("Already claimed");
    if (req.user.coins < coupon.cost) throw badRequest("Not enough coins");

    req.user.coins -= coupon.cost;
    req.user.claimedCoupons.push(coupon.code);
    await req.user.save();

    res.json({ coupon, coins: req.user.coins });
  }),
);

export default router;
