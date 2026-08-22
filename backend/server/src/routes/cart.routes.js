import express from "express";
import { z } from "zod";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler, notFound, badRequest } from "../utils/errors.js";

const router = express.Router();
router.use(requireAuth);

async function loadCart(userId) {
  return (await Cart.findOne({ user: userId }).populate("items.product").populate("items.seller")) ||
    (await Cart.create({ user: userId, items: [] }));
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json({ cart: await loadCart(req.user._id) });
  }),
);

const addSchema = z.object({
  productSlug: z.string().trim().min(1),
  sellerId: z.string().trim().min(1),
  qty: z.coerce.number().min(1).max(99).default(1),
});

router.post(
  "/items",
  validate(addSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.body.productSlug });
    if (!product) throw notFound("Product not found");

    const offer = product.offers.find((o) => String(o.seller) === req.body.sellerId);
    if (!offer) throw badRequest("This seller does not stock the product");
    if (offer.stock < req.body.qty) throw badRequest("Not enough stock");

    const cart = await Cart.findOneAndUpdate({ user: req.user._id }, {}, { upsert: true, new: true });
    const existing = cart.items.find(
      (i) => String(i.product) === String(product._id) && String(i.seller) === req.body.sellerId,
    );
    if (existing) existing.qty = Math.min(99, existing.qty + req.body.qty);
    else cart.items.push({ product: product._id, seller: offer.seller, qty: req.body.qty });
    await cart.save();

    res.status(201).json({ cart: await loadCart(req.user._id) });
  }),
);

router.patch(
  "/items",
  validate(z.object({ productId: z.string(), sellerId: z.string(), qty: z.coerce.number().min(0).max(99) })),
  asyncHandler(async (req, res) => {
    const cart = await loadCart(req.user._id);
    const idx = cart.items.findIndex(
      (i) => String(i.product?._id ?? i.product) === req.body.productId && String(i.seller?._id ?? i.seller) === req.body.sellerId,
    );
    if (idx === -1) throw notFound("Item not in cart");
    if (req.body.qty === 0) cart.items.splice(idx, 1);
    else cart.items[idx].qty = req.body.qty;
    await cart.save();
    res.json({ cart: await loadCart(req.user._id) });
  }),
);

router.delete(
  "/",
  asyncHandler(async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
    res.json({ ok: true });
  }),
);

export default router;
