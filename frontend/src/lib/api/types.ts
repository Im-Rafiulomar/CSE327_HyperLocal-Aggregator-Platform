export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "buyer" | "seller" | "admin";
  language: "en" | "bn";
  avatarEmoji: string;
  coins: number;
  wishlist: string[];
  notificationPrefs: Record<string, boolean>;
  seller?: string;
  addresses?: ApiAddress[];
};

export type ApiAddress = {
  _id?: string;
  label?: string;
  line1?: string;
  area?: string;
  city?: string;
  postcode?: string;
  isDefault?: boolean;
};

export type SellerProfile = {
  _id: string;
  slug: string;
  name: string;
  nameBn?: string;
  area?: string;
  rating?: number;
  isLocal?: boolean;
  verified?: boolean;
  since?: string;
  responseTime?: string;
};

export type ApiOffer = { seller: string | SellerProfile; price: number; stock: number; delivery?: string };

export type ApiProduct = {
  _id: string;
  slug: string;
  name: string;
  nameBn?: string;
  brand?: string;
  category: string;
  image?: string;
  emoji?: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  reviewCount?: number;
  description?: string;
  tags?: string[];
  offers: ApiOffer[];
};

export type Session = { user: ApiUser; sellerProfile: SellerProfile | null; accessToken: string };

export type Paginated<T> = { items: T[]; page: number; total: number };

export type ListingInput = {
  name: string;
  nameBn?: string;
  brand?: string;
  category: string;
  description?: string;
  image?: string;
  emoji?: string;
  price: number;
  oldPrice?: number;
  stock: number;
  delivery?: string;
  tags?: string[];
  attachToSlug?: string;
};

export type VisionResult = {
  labels: string[];
  category?: string;
  query?: string;
  description?: string;
  confidence?: number;
  source?: string;
  warning?: string;
  items: ApiProduct[];
};

export type VoiceResult = { transcript: string; items: ApiProduct[] };
