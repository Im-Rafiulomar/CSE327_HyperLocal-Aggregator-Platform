import { Product } from "../../models/Product.js";
import { Seller } from "../../models/Seller.js";
import { badRequest, forbidden, notFound } from "../../utils/errors.js";

/** Slug generation isolated so it can be reused/tested (SRP). */
export class SlugFactory {
  static fromName(name) {
    return `${String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50)}-${Math.random().toString(36).slice(2, 6)}`;
  }
}

/**
 * All seller catalogue rules live here: creating a listing, updating your own
 * offer, removing it. Routes stay thin controllers (SRP), and ownership is
 * always re-checked against the database (never trusted from the client).
 */
export class SellerCatalogService {
  constructor({ products = Product, sellers = Seller, slugFactory = SlugFactory } = {}) {
    this.products = products;
    this.sellers = sellers;
    this.slugFactory = slugFactory;
  }

  async requireSellerProfile(user) {
    if (!user?.seller) throw forbidden("This account has no seller profile");
    const seller = await this.sellers.findById(user.seller);
    if (!seller) throw notFound("Seller profile not found");
    return seller;
  }

  /** Creates a new product, or attaches this seller's offer to an existing one. */
  async createListing(user, input) {
    const seller = await this.requireSellerProfile(user);
    const offer = { seller: seller._id, price: input.price, stock: input.stock ?? 0, delivery: input.delivery || "2-3 days" };

    if (input.attachToSlug) {
      const existing = await this.products.findOne({ slug: input.attachToSlug });
      if (!existing) throw notFound("Product not found");
      if (existing.offers.some((o) => String(o.seller) === String(seller._id)))
        throw badRequest("You already sell this product — edit your offer instead");
      existing.offers.push(offer);
      existing.price = Math.min(existing.price, offer.price);
      await existing.save();
      return existing;
    }

    if (await this.products.exists({ slug: input.slug })) throw badRequest("That slug is already taken");

    return this.products.create({
      slug: input.slug || this.slugFactory.fromName(input.name),
      name: input.name,
      nameBn: input.nameBn || "",
      brand: input.brand || "",
      category: input.category,
      image: input.image || "",
      emoji: input.emoji || "📦",
      price: input.price,
      oldPrice: input.oldPrice,
      description: input.description || "",
      descriptionBn: input.descriptionBn || "",
      tags: input.tags ?? [],
      offers: [offer],
      rating: 0,
      reviewCount: 0,
    });
  }

  async listMine(user) {
    const seller = await this.requireSellerProfile(user);
    return this.products.find({ "offers.seller": seller._id }).lean();
  }

  async updateListing(user, slug, patch) {
    const seller = await this.requireSellerProfile(user);
    const product = await this.products.findOne({ slug });
    if (!product) throw notFound("Product not found");

    const offer = product.offers.find((o) => String(o.seller) === String(seller._id));
    if (!offer) throw forbidden("You do not sell this product");

    if (patch.price != null) offer.price = patch.price;
    if (patch.stock != null) offer.stock = patch.stock;
    if (patch.delivery) offer.delivery = patch.delivery;

    // descriptive fields may only be edited by the seller who created it alone
    if (product.offers.length === 1) {
      for (const field of ["name", "nameBn", "brand", "category", "image", "emoji", "description", "descriptionBn"]) {
        if (patch[field] != null) product[field] = patch[field];
      }
      if (patch.tags) product.tags = patch.tags;
    }

    product.price = Math.min(...product.offers.map((o) => o.price));
    await product.save();
    return product;
  }

  async removeListing(user, slug) {
    const seller = await this.requireSellerProfile(user);
    const product = await this.products.findOne({ slug });
    if (!product) throw notFound("Product not found");
    if (!product.offers.some((o) => String(o.seller) === String(seller._id))) throw forbidden("You do not sell this product");

    product.offers = product.offers.filter((o) => String(o.seller) !== String(seller._id));
    if (product.offers.length === 0) {
      await product.deleteOne();
      return { removed: true, productDeleted: true };
    }
    product.price = Math.min(...product.offers.map((o) => o.price));
    await product.save();
    return { removed: true, productDeleted: false };
  }

  async updateProfile(user, patch) {
    const seller = await this.requireSellerProfile(user);
    for (const field of ["name", "nameBn", "area", "responseTime"]) {
      if (patch[field] != null) seller[field] = patch[field];
    }
    await seller.save();
    return seller;
  }
}

export const sellerCatalogService = new SellerCatalogService();
