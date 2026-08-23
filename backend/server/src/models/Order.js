import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    name: String,
    emoji: String,
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const trackingSchema = new mongoose.Schema(
  { label: String, labelBn: String, at: Date, done: { type: Boolean, default: false } },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: { type: [itemSchema], validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    delivery: { type: Number, default: 0, min: 0 },
    coinsUsed: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coinsEarned: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, enum: ["cod", "bkash", "card", "wallet"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: {
      type: String,
      enum: ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    address: {
      label: String,
      line1: String,
      area: String,
      city: String,
      postcode: String,
    },
    tracking: [trackingSchema],
  },
  { timestamps: true },
);

export const Order = mongoose.model("Order", orderSchema);
