import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 2000 },
    // populated by the fake-review heuristics in services/fakeReview.js
    suspicious: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
  },
  { timestamps: true },
);

export const Review = mongoose.model("Review", reviewSchema);
