import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    price: { type: Number, required: true, min: 0 },
    delivery: { type: String, default: "2-3 days" },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: "" },
    brand: { type: String, default: "", index: true },
    category: { type: String, required: true, index: true },
    image: { type: String, default: "" },
    emoji: { type: String, default: "📦" },
    price: { type: Number, required: true, min: 0, index: true },
    oldPrice: { type: Number, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5, index: true },
    reviewCount: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "" },
    descriptionBn: { type: String, default: "" },
    specs: { type: Map, of: String, default: {} },
    offers: [offerSchema],
    aiSummary: { type: String, default: "" },
    tags: [String],
  },
  { timestamps: true },
);

productSchema.index({ name: "text", brand: "text", description: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema);
