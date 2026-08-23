import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "Home" },
    line1: String,
    area: String,
    city: String,
    postcode: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, maxlength: 20 },
    password: {
      type: String,
      // social accounts have no local password
      required() {
        return this.authProvider === "local";
      },
      minlength: 8,
      select: false,
    },
    authProvider: { type: String, enum: ["local", "firebase"], default: "local" },
    firebaseUid: { type: String, index: true, sparse: true },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer", index: true },
    language: { type: String, enum: ["en", "bn"], default: "en" },
    avatarEmoji: { type: String, default: "🙂" },
    addresses: [addressSchema],
    coins: { type: Number, default: 0, min: 0 },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    claimedCoupons: [{ type: String }],
    notificationPrefs: {
      priceDrops: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      recommendations: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
    },
    // set when role === "seller"
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    refreshTokens: { type: [String], default: [], select: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublic = function toPublic() {
  const { _id, name, email, phone, role, language, avatarEmoji, addresses, coins, wishlist, notificationPrefs, seller, authProvider } = this;
  return { id: _id, name, email, phone, role, language, avatarEmoji, addresses, coins, wishlist, notificationPrefs, seller, authProvider };
};

export const User = mongoose.model("User", userSchema);
