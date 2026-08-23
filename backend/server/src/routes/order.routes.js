import express from "express";
import { z } from "zod";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { Notification } from "../models/Notification.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, badRequest, notFound, forbidden } from "../utils/errors.js";

const router = express.Router();
router.use(requireAuth);

const DELIVERY_FEE = 60;
const COIN_VALUE = 1; // 1 coin = ৳1 off
const EARN_RATE = 50; // 1 coin per ৳50 spent

const checkoutSchema = z.object({
  paymentMethod: z.enum(["cod", "bkash", "card", "wallet"]),
  coinsToUse: z.coerce.number().min(0).default(0),
  address: z.object({
    label: z.string().max(40).optional(),
    line1: z.string().min(3).max(160),
    area: z.string().max(80).optional(),
    city: z.string().max(80).optional(),
    postcode: z.string().max(20).optional(),
  }),
});

const TRACKING = [
  { label: "Order placed", labelBn: "অর্ডার হয়েছে" },
  { label: "Confirmed by seller", labelBn: "বিক্রেতা নিশ্চিত করেছে" },
  { label: "Packed", labelBn: "প্যাক হয়েছে" },
  { label: "Out for delivery", labelBn: "ডেলিভারিতে" },
  { label: "Delivered", labelBn: "ডেলিভারি সম্পন্ন" },
];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ items: orders });
  }),
);

router.get(
  "/:code",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ code: req.params.code }).lean();
    if (!order) throw notFound("Order not found");
    if (String(order.user) !== String(req.user._id) && req.user.role !== "admin") throw forbidden();
    res.json({ order });
  }),
);

router.post(
  "/checkout",
  validate(checkoutSchema),
  asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) throw badRequest("Your cart is empty");

    const items = cart.items.map((i) => {
      const offer = i.product.offers.find((o) => String(o.seller) === String(i.seller));
      if (!offer) throw badRequest(`${i.product.name} is no longer sold by that seller`);
      if (offer.stock < i.qty) throw badRequest(`Only ${offer.stock} left of ${i.product.name}`);
      return {
        product: i.product._id,
        seller: i.seller,
        name: i.product.name,
        emoji: i.product.emoji,
        price: offer.price,
        qty: i.qty,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const coinsUsed = Math.min(req.user.coins, Math.max(0, Math.floor(req.body.coinsToUse)), subtotal);
    const discount = coinsUsed * COIN_VALUE;
    const total = Math.max(0, subtotal + DELIVERY_FEE - discount);
    const coinsEarned = Math.floor(subtotal / EARN_RATE);

    const order = await Order.create({
      code: `HL-${Date.now().toString().slice(-6)}`,
      user: req.user._id,
      items,
      subtotal,
      delivery: DELIVERY_FEE,
      coinsUsed,
      discount,
      total,
      coinsEarned,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: req.body.paymentMethod === "cod" ? "pending" : "paid",
      address: req.body.address,
      tracking: TRACKING.map((t, i) => ({ ...t, done: i === 0, at: i === 0 ? new Date() : undefined })),
    });

    // decrement stock
    for (const i of items) {
      await Product.updateOne(
        { _id: i.product, "offers.seller": i.seller },
        { $inc: { "offers.$.stock": -i.qty } },
      );
    }

    req.user.coins = req.user.coins - coinsUsed + coinsEarned;
    await req.user.save();
    cart.items = [];
    await cart.save();

    await Notification.create({
      user: req.user._id,
      type: "order",
      title: `Order ${order.code} placed — ${coinsEarned} coins earned`,
      titleBn: `অর্ডার ${order.code} সম্পন্ন`,
    });

    res.status(201).json({ order, coins: req.user.coins });
  }),
);

// seller/admin advances the tracking state
router.patch(
  "/:code/status",
  requireRole("seller", "admin"),
  validate(z.object({ status: z.enum(["confirmed", "packed", "out_for_delivery", "delivered", "cancelled"]) })),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ code: req.params.code });
    if (!order) throw notFound("Order not found");
    if (
      req.user.role === "seller" &&
      !order.items.some((i) => String(i.seller) === String(req.user.seller))
    ) {
      throw forbidden("This order has none of your items");
    }

    order.status = req.body.status;
    const index = ["placed", "confirmed", "packed", "out_for_delivery", "delivered"].indexOf(req.body.status);
    order.tracking = order.tracking.map((t, i) => ({
      ...t.toObject(),
      done: i <= index,
      at: i <= index ? t.at || new Date() : undefined,
    }));
    await order.save();

    await Notification.create({
      user: order.user,
      type: "order",
      title: `Order ${order.code} is now ${req.body.status.replace(/_/g, " ")}`,
    });

    res.json({ order });
  }),
);

export default router;
