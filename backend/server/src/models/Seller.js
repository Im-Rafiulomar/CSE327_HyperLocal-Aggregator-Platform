import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    area: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isLocal: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    since: { type: String, default: "" },
    responseTime: { type: String, default: "~30 min" },
  },
  { timestamps: true },
);

export const Seller = mongoose.model("Seller", sellerSchema);
