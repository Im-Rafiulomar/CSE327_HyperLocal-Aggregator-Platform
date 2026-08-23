import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    label: { type: String, required: true },
    cost: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ["flat", "percent", "free_delivery"], default: "flat" },
    discountValue: { type: Number, default: 0, min: 0 },
    expires: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model("Coupon", couponSchema);
