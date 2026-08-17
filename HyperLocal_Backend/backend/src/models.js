
import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema({
  sellerId: { type: String, unique: true, required: true, index: true },
  name: String, nameBn: String, area: String, rating: Number,
  isLocal: Boolean, verified: Boolean, since: String, responseTime: String
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  categoryId: { type: String, unique: true, required: true, index: true },
  name: String, nameBn: String, emoji: String
});

const ReviewSchema = new mongoose.Schema({
  id: String, user: String, rating: Number, text: String, date: String,
  suspicious: Boolean, reason: String
}, { _id: false });

const OfferSchema = new mongoose.Schema({
  sellerId: String, price: Number, delivery: String, stock: Number
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  productId: { type: String, unique: true, required: true, index: true },
  name: String, nameBn: String, brand: String, category: String,
  image: String, emoji: String, price: Number, oldPrice: Number,
  rating: Number, reviewCount: Number, description: String, descriptionBn: String,
  specs: mongoose.Schema.Types.Mixed, offers: [OfferSchema],
  reviews: [ReviewSchema], aiSummary: String, tags: [String]
}, { timestamps: true });

const CartLineSchema = new mongoose.Schema({
  productId: String, sellerId: String, qty: Number
}, { _id: false });

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  name: String, email: { type: String, unique: true, sparse: true },
  passwordHash: String, role: { type: String, enum: ["customer", "seller"], default: "customer" },
  coins: { type: Number, default: 1240 },
  wishlist: { type: [String], default: ["p1", "p6"] },
  viewed: { type: [String], default: ["p1", "p7"] },
  cart: { type: [CartLineSchema], default: [{ productId: "p3", sellerId: "s4", qty: 1 }] },
  phone: { type: String, default: "+880 1712 345678" },
  area: { type: String, default: "Dhanmondi, Dhaka" }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true, index: true },
  userId: String, items: [{ productId: String, sellerId: String, qty: Number, price: Number }],
  total: Number, payment: String, status: { type: Number, default: 0 }, seller: String,
  date: String
}, { timestamps: true });

export const Seller = mongoose.model("Seller", SellerSchema);
export const Category = mongoose.model("Category", CategorySchema);
export const Product = mongoose.model("Product", ProductSchema);
export const User = mongoose.model("User", UserSchema);
export const Order = mongoose.model("Order", OrderSchema);
