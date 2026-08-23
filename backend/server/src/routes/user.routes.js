import express from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, notFound } from "../utils/errors.js";

const router = express.Router();
router.use(requireAuth);

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  language: z.enum(["en", "bn"]).optional(),
  avatarEmoji: z.string().max(8).optional(),
  notificationPrefs: z
    .object({
      priceDrops: z.boolean().optional(),
      orderUpdates: z.boolean().optional(),
      recommendations: z.boolean().optional(),
      promotions: z.boolean().optional(),
    })
    .optional(),
});

router.patch(
  "/me",
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    const { notificationPrefs, ...rest } = req.body;
    Object.assign(req.user, rest);
    if (notificationPrefs) Object.assign(req.user.notificationPrefs, notificationPrefs);
    await req.user.save();
    res.json({ user: req.user.toPublic() });
  }),
);

const addressSchema = z.object({
  label: z.string().max(40).default("Home"),
  line1: z.string().min(3).max(160),
  area: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  postcode: z.string().max(20).optional(),
  isDefault: z.boolean().default(false),
});

router.post(
  "/me/addresses",
  validate(addressSchema),
  asyncHandler(async (req, res) => {
    if (req.body.isDefault) req.user.addresses.forEach((a) => (a.isDefault = false));
    req.user.addresses.push(req.body);
    await req.user.save();
    res.status(201).json({ addresses: req.user.addresses });
  }),
);

router.delete(
  "/me/addresses/:id",
  asyncHandler(async (req, res) => {
    const addr = req.user.addresses.id(req.params.id);
    if (!addr) throw notFound("Address not found");
    addr.deleteOne();
    await req.user.save();
    res.json({ addresses: req.user.addresses });
  }),
);

router.get(
  "/me/wishlist",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json({ items: user.wishlist });
  }),
);

router.post(
  "/me/wishlist/:productId",
  asyncHandler(async (req, res) => {
    const id = req.params.productId;
    const exists = req.user.wishlist.some((w) => String(w) === id);
    req.user.wishlist = exists ? req.user.wishlist.filter((w) => String(w) !== id) : [...req.user.wishlist, id];
    await req.user.save();
    res.json({ wishlist: req.user.wishlist, saved: !exists });
  }),
);

router.get(
  "/me/notifications",
  asyncHandler(async (req, res) => {
    res.json({ items: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30).lean() });
  }),
);

router.post(
  "/me/notifications/read",
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ ok: true });
  }),
);

export default router;
