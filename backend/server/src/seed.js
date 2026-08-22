/**
 * Seeds MongoDB with the demo catalogue, sellers, coupons and two demo accounts.
 * Run: npm run seed
 */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Seller } from "./models/Seller.js";
import { Product } from "./models/Product.js";
import { Review } from "./models/Review.js";
import { Coupon } from "./models/Coupon.js";
import { Cart } from "./models/Cart.js";
import { Order } from "./models/Order.js";
import { Notification } from "./models/Notification.js";
import { sellers, products, coupons } from "./seed-data.js";
import { analyzeReview } from "./services/fakeReview.js";

async function run() {
  await connectDB();
  console.log("[seed] clearing collections…");
  await Promise.all([
    User.deleteMany({}),
    Seller.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
    Cart.deleteMany({}),
    Order.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const sellerDocs = await Seller.insertMany(
    sellers.map((s) => ({
      slug: s.id,
      name: s.name,
      nameBn: s.nameBn,
      area: s.area,
      rating: s.rating,
      isLocal: s.isLocal,
      verified: s.verified,
      since: s.since,
      responseTime: s.responseTime,
    })),
  );
  const sellerBySlug = Object.fromEntries(sellerDocs.map((s) => [s.slug, s._id]));

  const productDocs = await Product.insertMany(
    products.map((p) => ({
      slug: p.id,
      name: p.name,
      nameBn: p.nameBn,
      brand: p.brand,
      category: p.category,
      image: p.image,
      emoji: p.emoji,
      price: p.price,
      oldPrice: p.oldPrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      description: p.description,
      descriptionBn: p.descriptionBn,
      specs: p.specs,
      aiSummary: p.aiSummary,
      tags: p.tags,
      offers: p.offers.map((o) => ({
        seller: sellerBySlug[o.sellerId],
        price: o.price,
        delivery: o.delivery,
        stock: o.stock,
      })),
    })),
  );
  const productBySlug = Object.fromEntries(productDocs.map((p) => [p.slug, p._id]));

  const reviews = [];
  for (const p of products) {
    for (const r of p.reviews || []) {
      const verdict = analyzeReview({ text: r.text, rating: r.rating, authorName: r.user, historyCount: 1 });
      reviews.push({
        product: productBySlug[p.id],
        authorName: r.user,
        rating: r.rating,
        text: r.text,
        suspicious: r.suspicious ?? verdict.suspicious,
        reason: r.reason ?? verdict.reason,
        trustScore: verdict.trustScore,
      });
    }
  }
  await Review.insertMany(reviews);

  await Coupon.insertMany(
    coupons.map((c) => ({
      code: c.code,
      label: c.label,
      cost: c.cost,
      expires: c.expires,
      discountType: /delivery/i.test(c.label) ? "free_delivery" : "flat",
      discountValue: Number((c.label.match(/(\d+)/) || [0, 0])[1]),
    })),
  );

  // demo accounts — password: Password123
  const buyer = await User.create({
    name: "Ayesha Rahman",
    email: "buyer@hyperlocal.test",
    password: "Password123",
    phone: "+8801700000001",
    role: "buyer",
    language: "en",
    coins: 1240,
    addresses: [{ label: "Home", line1: "House 12, Road 7", area: "Dhanmondi", city: "Dhaka", isDefault: true }],
  });

  const sellerUser = await User.create({
    name: "Rakib Hasan",
    email: "seller@hyperlocal.test",
    password: "Password123",
    phone: "+8801700000002",
    role: "seller",
    coins: 300,
    seller: sellerDocs[0]._id,
  });
  await Seller.findByIdAndUpdate(sellerDocs[0]._id, { owner: sellerUser._id });

  await Notification.insertMany([
    { user: buyer._id, type: "price", title: "Price dropped on a saved item" },
    { user: buyer._id, type: "reward", title: "You earned 129 coins" },
  ]);

  console.log(`[seed] done — ${productDocs.length} products, ${reviews.length} reviews, ${sellerDocs.length} sellers`);
  console.log("[seed] buyer@hyperlocal.test / seller@hyperlocal.test — password: Password123");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
