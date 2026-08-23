import * as React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { HeadContent, Link, Outlet, Scripts, createFileRoute, createRootRouteWithContext, createRouter, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup, signOut } from "firebase/auth";
import { AlertTriangle, Banknote, Bell, Bot, Camera, Check, CheckCircle2, ClipboardCheck, Clock, Coins, CreditCard, Eye, EyeOff, Gift, Globe, Heart, Home, ImagePlus, Languages, Loader2, LogIn, MapPin, Mic, Minus, Package, PackagePlus, Plus, Save, Search, Send, ServerCrash, Settings, ShieldCheck, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Sparkles, Square, Star, Store, Ticket, Trash2, TrendingUp, Truck, Upload, User, UserPlus, Wallet, X, Zap } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//#region src/styles.css?url
var styles_default = "/assets/styles-Cb3ESoVF.css";
//#endregion
//#region src/lib/lovable-error-reporting.ts
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
//#endregion
//#region src/lib/i18n.tsx
var dict = {
	brand: {
		en: "HyperLocal",
		bn: "হাইপারলোকাল"
	},
	tagline: {
		en: "Local shops. Online reach. One smart marketplace.",
		bn: "স্থানীয় দোকান। অনলাইন পরিসর। একটি স্মার্ট মার্কেটপ্লেস।"
	},
	searchPlaceholder: {
		en: "Search products, brands or shops…",
		bn: "পণ্য, ব্র্যান্ড বা দোকান খুঁজুন…"
	},
	home: {
		en: "Home",
		bn: "হোম"
	},
	categories: {
		en: "Categories",
		bn: "ক্যাটাগরি"
	},
	assistant: {
		en: "AI Assistant",
		bn: "এআই সহকারী"
	},
	orders: {
		en: "Orders",
		bn: "অর্ডার"
	},
	wishlist: {
		en: "Wishlist",
		bn: "উইশলিস্ট"
	},
	cart: {
		en: "Cart",
		bn: "কার্ট"
	},
	rewards: {
		en: "Rewards",
		bn: "রিওয়ার্ড"
	},
	profile: {
		en: "Profile",
		bn: "প্রোফাইল"
	},
	seller: {
		en: "Seller",
		bn: "বিক্রেতা"
	},
	notifications: {
		en: "Notifications",
		bn: "নোটিফিকেশন"
	},
	addToCart: {
		en: "Add to cart",
		bn: "কার্টে যোগ করুন"
	},
	buyNow: {
		en: "Buy now",
		bn: "এখনই কিনুন"
	},
	compareSellers: {
		en: "Compare sellers",
		bn: "বিক্রেতা তুলনা"
	},
	recommended: {
		en: "Recommended for you",
		bn: "আপনার জন্য প্রস্তাবিত"
	},
	trending: {
		en: "Trending near you",
		bn: "আপনার আশেপাশে জনপ্রিয়"
	},
	visualSearch: {
		en: "Visual search",
		bn: "ছবি দিয়ে খুঁজুন"
	},
	voiceSearch: {
		en: "Voice search",
		bn: "ভয়েস সার্চ"
	},
	reviews: {
		en: "Reviews",
		bn: "রিভিউ"
	},
	aiSummary: {
		en: "AI review summary",
		bn: "এআই রিভিউ সারাংশ"
	},
	flagged: {
		en: "Flagged as suspicious",
		bn: "সন্দেহজনক হিসেবে চিহ্নিত"
	},
	checkout: {
		en: "Checkout",
		bn: "চেকআউট"
	},
	total: {
		en: "Total",
		bn: "মোট"
	},
	emptyCart: {
		en: "Your cart is empty",
		bn: "আপনার কার্ট খালি"
	},
	emptyWishlist: {
		en: "Nothing saved yet",
		bn: "কিছু সংরক্ষিত নেই"
	},
	trackOrder: {
		en: "Track order",
		bn: "অর্ডার ট্র্যাক"
	},
	coins: {
		en: "coins",
		bn: "কয়েন"
	},
	redeem: {
		en: "Redeem",
		bn: "রিডিম"
	},
	placeOrder: {
		en: "Place order",
		bn: "অর্ডার করুন"
	},
	filters: {
		en: "Filters",
		bn: "ফিল্টার"
	},
	sortBy: {
		en: "Sort by",
		bn: "সাজান"
	},
	specs: {
		en: "Specifications",
		bn: "স্পেসিফিকেশন"
	},
	localSeller: {
		en: "Local seller",
		bn: "স্থানীয় বিক্রেতা"
	},
	verified: {
		en: "Verified",
		bn: "যাচাইকৃত"
	},
	results: {
		en: "results",
		bn: "ফলাফল"
	}
};
var Ctx$1 = createContext({
	lang: "en",
	setLang: () => {},
	t: (k) => dict[k].en
});
function LanguageProvider({ children }) {
	const [lang, setLang] = useState("en");
	useEffect(() => {
		const saved = window.localStorage.getItem("hl-lang");
		if (saved) setLang(saved);
	}, []);
	useEffect(() => {
		window.localStorage.setItem("hl-lang", lang);
	}, [lang]);
	const value = useMemo(() => ({
		lang,
		setLang,
		t: (k) => dict[k][lang]
	}), [lang]);
	return /* @__PURE__ */ jsx(Ctx$1.Provider, {
		value,
		children
	});
}
var useLang = () => useContext(Ctx$1);
var bnDigits = [
	"০",
	"১",
	"২",
	"৩",
	"৪",
	"৫",
	"৬",
	"৭",
	"৮",
	"৯"
];
function money(n, lang) {
	const s = n.toLocaleString("en-US");
	return "৳" + (lang === "bn" ? s.replace(/\d/g, (d) => bnDigits[Number(d)]) : s);
}
//#endregion
//#region src/lib/http/ApiError.ts
var ApiError = class extends Error {
	status;
	details;
	constructor(status, message, details) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
};
//#endregion
//#region src/lib/http/TokenStore.ts
/**
* Singleton + Observer: one place holds the in-memory access token and
* notifies subscribers when it changes. Nothing else touches the raw value.
*/
var TokenStore = class {
	token = null;
	listeners = /* @__PURE__ */ new Set();
	get() {
		return this.token;
	}
	set(token) {
		this.token = token;
		this.listeners.forEach((l) => l(token));
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
};
var tokenStore = new TokenStore();
//#endregion
//#region src/lib/http/HttpClient.ts
var HttpClient = class {
	baseUrl;
	tokens;
	onUnauthorized;
	constructor({ baseUrl, tokens = tokenStore, onUnauthorized }) {
		this.baseUrl = baseUrl;
		this.tokens = tokens;
		this.onUnauthorized = onUnauthorized;
	}
	async send(path, init = {}) {
		const token = this.tokens.get();
		const res = await fetch(`${this.baseUrl}${path}`, {
			...init,
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				...token ? { Authorization: `Bearer ${token}` } : {},
				...init.headers ?? {}
			}
		});
		const text = await res.text();
		const body = text ? JSON.parse(text) : {};
		if (!res.ok) throw new ApiError(res.status, body.error ?? res.statusText, body.details);
		return body;
	}
	/** Retries once through the refresh hook when the session expired. */
	async request(path, init = {}) {
		try {
			return await this.send(path, init);
		} catch (err) {
			if (err instanceof ApiError && err.status === 401 && this.onUnauthorized) {
				if (await this.onUnauthorized(this, path)) return this.send(path, init);
			}
			throw err;
		}
	}
	get(path) {
		return this.request(path);
	}
	post(path, body) {
		return this.request(path, body === void 0 ? { method: "POST" } : {
			method: "POST",
			body: JSON.stringify(body)
		});
	}
	patch(path, body) {
		return this.request(path, body === void 0 ? { method: "PATCH" } : {
			method: "PATCH",
			body: JSON.stringify(body)
		});
	}
	/** Multipart upload — no Content-Type/JSON body, the browser sets the boundary. */
	async uploadFile(path, formData) {
		const send = async () => {
			const token = this.tokens.get();
			const res = await fetch(`${this.baseUrl}${path}`, {
				method: "POST",
				credentials: "include",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				body: formData
			});
			const text = await res.text();
			const body = text ? JSON.parse(text) : {};
			if (!res.ok) throw new ApiError(res.status, body.error ?? res.statusText, body.details);
			return body;
		};
		try {
			return await send();
		} catch (err) {
			if (err instanceof ApiError && err.status === 401 && this.onUnauthorized) {
				if (await this.onUnauthorized(this, path)) return send();
			}
			throw err;
		}
	}
	delete(path) {
		return this.request(path, { method: "DELETE" });
	}
};
//#endregion
//#region src/lib/api/BaseRepository.ts
/** Every resource repository owns exactly one API area (SRP). */
var BaseRepository = class {
	http;
	constructor(http) {
		this.http = http;
	}
	qs(params) {
		return new URLSearchParams(Object.entries(params).filter(([, v]) => v !== void 0 && v !== "")).toString();
	}
};
//#endregion
//#region src/lib/api/repositories.ts
var AuthRepository = class extends BaseRepository {
	register(data) {
		return this.http.post("/auth/register", data);
	}
	login(data) {
		return this.http.post("/auth/login", data);
	}
	firebaseConfig() {
		return this.http.get("/auth/firebase/config");
	}
	loginWithFirebase(data) {
		return this.http.post("/auth/firebase", data);
	}
	refresh() {
		return this.http.post("/auth/refresh");
	}
	logout() {
		return this.http.post("/auth/logout");
	}
	me() {
		return this.http.get("/auth/me");
	}
};
var ProductRepository = class extends BaseRepository {
	list(params = {}) {
		return this.http.get(`/products?${this.qs(params)}`);
	}
	categories() {
		return this.http.get("/products/categories");
	}
	detail(slug) {
		return this.http.get(`/products/${slug}`);
	}
	recommendations() {
		return this.http.get("/products/recommendations");
	}
	updateOffer(slug, data) {
		return this.http.patch(`/products/${slug}/offer`, data);
	}
};
var ReviewRepository = class extends BaseRepository {
	create(data) {
		return this.http.post("/reviews", data);
	}
	remove(id) {
		return this.http.delete(`/reviews/${id}`);
	}
};
var CartRepository = class extends BaseRepository {
	get() {
		return this.http.get("/cart");
	}
	add(data) {
		return this.http.post("/cart/items", data);
	}
	setQty(data) {
		return this.http.patch("/cart/items", data);
	}
	clear() {
		return this.http.delete("/cart");
	}
};
var OrderRepository = class extends BaseRepository {
	list() {
		return this.http.get("/orders");
	}
	detail(code) {
		return this.http.get(`/orders/${code}`);
	}
	checkout(data) {
		return this.http.post("/orders/checkout", data);
	}
	setStatus(code, status) {
		return this.http.patch(`/orders/${code}/status`, { status });
	}
};
var UserRepository = class extends BaseRepository {
	updateProfile(data) {
		return this.http.patch("/users/me", data);
	}
	addAddress(data) {
		return this.http.post("/users/me/addresses", data);
	}
	removeAddress(id) {
		return this.http.delete(`/users/me/addresses/${id}`);
	}
	wishlist() {
		return this.http.get("/users/me/wishlist");
	}
	toggleWishlist(productId) {
		return this.http.post(`/users/me/wishlist/${productId}`);
	}
	notifications() {
		return this.http.get("/users/me/notifications");
	}
	markNotificationsRead() {
		return this.http.post("/users/me/notifications/read");
	}
};
var RewardRepository = class extends BaseRepository {
	coupons() {
		return this.http.get("/rewards/coupons");
	}
	me() {
		return this.http.get("/rewards/me");
	}
	redeem(code) {
		return this.http.post(`/rewards/redeem/${code}`);
	}
};
var SellerRepository = class extends BaseRepository {
	list() {
		return this.http.get("/sellers");
	}
	detail(slug) {
		return this.http.get(`/sellers/${slug}`);
	}
	dashboard() {
		return this.http.get("/sellers/me/dashboard");
	}
	orders() {
		return this.http.get("/sellers/me/orders");
	}
	/** Seller-owned catalogue management. */
	myProfile() {
		return this.http.get("/sellers/me/profile");
	}
	updateMyProfile(data) {
		return this.http.patch("/sellers/me/profile", data);
	}
	myProducts() {
		return this.http.get("/sellers/me/products");
	}
	createProduct(data) {
		return this.http.post("/sellers/me/products", data);
	}
	updateProduct(slug, data) {
		return this.http.patch(`/sellers/me/products/${slug}`, data);
	}
	deleteProduct(slug) {
		return this.http.delete(`/sellers/me/products/${slug}`);
	}
	/** Uploads a product photo, returning the URL to store on the listing's `image` field. */
	uploadImage(file) {
		const formData = new FormData();
		formData.append("image", file);
		return this.http.uploadFile("/uploads/products", formData);
	}
};
var AiRepository = class extends BaseRepository {
	assistant(message) {
		return this.http.post("/ai/assistant", { message });
	}
	status() {
		return this.http.get("/ai/status");
	}
	/** AI image product detection — pass a base64 data URL from the camera. */
	imageSearch(input) {
		return this.http.post("/ai/image-search", input);
	}
	visualSearch(labels) {
		return this.http.post("/ai/visual-search", { labels });
	}
	/** AI voice search — send recorded audio, or a Web Speech transcript. */
	voiceSearch(input) {
		return this.http.post("/ai/voice-search", input);
	}
};
/**
* Composition root (Facade): wires the transport, the token store and every
* repository together once. Consumers depend on `apiClient`, never on fetch.
*/
var http = new HttpClient({
	baseUrl: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:5000/api",
		"VITE_FIREBASE_API_KEY": "AIzaSyDvpSx49QcDtAnqozUAFLJk-Qk8xTeNxMI",
		"VITE_FIREBASE_APP_ID": "1:395458214743:web:7376be2449925228511c12",
		"VITE_FIREBASE_AUTH_DOMAIN": "silver-pact-413210.firebaseapp.com",
		"VITE_FIREBASE_PROJECT_ID": "silver-pact-413210"
	}["VITE_API_URL"] ?? "http://localhost:5000/api",
	tokens: tokenStore,
	onUnauthorized: async (client, path) => {
		if (path.startsWith("/auth")) return false;
		const session = await client.send("/auth/refresh", { method: "POST" }).catch(() => null);
		if (!session) return false;
		tokenStore.set(session.accessToken);
		return true;
	}
});
var apiClient = {
	auth: new AuthRepository(http),
	products: new ProductRepository(http),
	reviews: new ReviewRepository(http),
	cart: new CartRepository(http),
	orders: new OrderRepository(http),
	users: new UserRepository(http),
	rewards: new RewardRepository(http),
	sellers: new SellerRepository(http),
	ai: new AiRepository(http)
};
//#endregion
//#region src/lib/api.ts
/**
* Public API facade for the Express + MongoDB backend (see /server).
*
* Structure (SOLID):
*   lib/http/HttpClient.ts  – transport only, retries a 401 through refresh
*   lib/http/TokenStore.ts  – single owner of the in-memory access token
*   lib/api/repositories.ts – one repository per resource
*   lib/api/client.ts       – composition root wiring them together
*
* Set VITE_API_URL in .env, e.g. VITE_API_URL=http://localhost:5000/api
*/
var setAccessToken = (token) => tokenStore.set(token);
/** Backwards-compatible object API — delegates to the repositories. */
var api = apiClient;
//#endregion
//#region src/lib/auth/firebase.ts
/**
* Thin adapter over the Firebase Web SDK (SRP: app init + popup sign-in
* only). Everything auth-session-related stays in AuthProvider — this
* module never touches React state or the backend session.
*/
/** Web config can come from build-time env vars, or be fetched from the API at runtime. */
var ENV_CONFIG = {
	apiKey: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:5000/api",
		"VITE_FIREBASE_API_KEY": "AIzaSyDvpSx49QcDtAnqozUAFLJk-Qk8xTeNxMI",
		"VITE_FIREBASE_APP_ID": "1:395458214743:web:7376be2449925228511c12",
		"VITE_FIREBASE_AUTH_DOMAIN": "silver-pact-413210.firebaseapp.com",
		"VITE_FIREBASE_PROJECT_ID": "silver-pact-413210"
	}["VITE_FIREBASE_API_KEY"] ?? null,
	authDomain: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:5000/api",
		"VITE_FIREBASE_API_KEY": "AIzaSyDvpSx49QcDtAnqozUAFLJk-Qk8xTeNxMI",
		"VITE_FIREBASE_APP_ID": "1:395458214743:web:7376be2449925228511c12",
		"VITE_FIREBASE_AUTH_DOMAIN": "silver-pact-413210.firebaseapp.com",
		"VITE_FIREBASE_PROJECT_ID": "silver-pact-413210"
	}["VITE_FIREBASE_AUTH_DOMAIN"] ?? null,
	projectId: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:5000/api",
		"VITE_FIREBASE_API_KEY": "AIzaSyDvpSx49QcDtAnqozUAFLJk-Qk8xTeNxMI",
		"VITE_FIREBASE_APP_ID": "1:395458214743:web:7376be2449925228511c12",
		"VITE_FIREBASE_AUTH_DOMAIN": "silver-pact-413210.firebaseapp.com",
		"VITE_FIREBASE_PROJECT_ID": "silver-pact-413210"
	}["VITE_FIREBASE_PROJECT_ID"] ?? null,
	appId: {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/",
		"VITE_API_URL": "http://localhost:5000/api",
		"VITE_FIREBASE_API_KEY": "AIzaSyDvpSx49QcDtAnqozUAFLJk-Qk8xTeNxMI",
		"VITE_FIREBASE_APP_ID": "1:395458214743:web:7376be2449925228511c12",
		"VITE_FIREBASE_AUTH_DOMAIN": "silver-pact-413210.firebaseapp.com",
		"VITE_FIREBASE_PROJECT_ID": "silver-pact-413210"
	}["VITE_FIREBASE_APP_ID"] ?? null
};
function hasEnvConfig() {
	return Boolean(ENV_CONFIG.apiKey && ENV_CONFIG.authDomain && ENV_CONFIG.projectId && ENV_CONFIG.appId);
}
function envConfig() {
	return ENV_CONFIG;
}
function isCompleteConfig(config) {
	return Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
}
var cachedApp = null;
var cachedAuth = null;
/** Initializes the Firebase app at most once (singleton), from whichever config is supplied. */
function getFirebaseAuth(config) {
	if (cachedAuth) return cachedAuth;
	if (!isCompleteConfig(config)) throw new Error("Firebase sign-in is not configured (missing apiKey/authDomain/projectId/appId)");
	const options = {
		apiKey: config.apiKey,
		authDomain: config.authDomain,
		projectId: config.projectId,
		appId: config.appId
	};
	cachedApp = getApps()[0] ?? initializeApp(options);
	cachedAuth = getAuth(cachedApp);
	return cachedAuth;
}
/**
* Opens the Google popup via Firebase Auth, then returns a fresh Firebase ID
* token for the signed-in user. The backend verifies this token server-side
* (POST /auth/firebase) — the client never asserts who it is.
*/
async function signInWithGooglePopup(config) {
	const auth = getFirebaseAuth(config);
	const provider = new GoogleAuthProvider();
	return (await signInWithPopup(auth, provider)).user.getIdToken();
}
/** Clears the local Firebase Auth session (separate from the backend's httpOnly refresh cookie). */
async function signOutOfFirebase() {
	if (!cachedAuth) return;
	await signOut(cachedAuth).catch(() => void 0);
}
/** Converts Firebase SDK errors into user-facing guidance. */
function toFirebaseAuthErrorMessage(error) {
	switch (typeof error === "object" && error !== null ? error.code : void 0) {
		case "auth/configuration-not-found": return "Google sign-in is not fully configured in Firebase. Enable Google in Firebase Authentication > Sign-in method and add localhost to Authorized domains.";
		case "auth/unauthorized-domain": return "This domain is not authorized for Firebase sign-in. Add localhost to Firebase Authentication > Settings > Authorized domains.";
		case "auth/popup-blocked": return "Popup was blocked by the browser. Allow popups for this site and try again.";
		case "auth/popup-closed-by-user": return "Google sign-in popup was closed before completion.";
		default: return error instanceof Error ? error.message : "Google sign-in failed";
	}
}
//#endregion
//#region src/lib/auth.tsx
var AuthContext = createContext(null);
/**
* Session provider (single source of truth for auth state).
* Transport, token storage and refresh live in the HttpClient/TokenStore —
* this component only owns React state (SRP).
*/
function AuthProvider({ children }) {
	const [user, setUserState] = useState(null);
	const [sellerProfile, setSellerProfileState] = useState(null);
	const [loading, setLoading] = useState(true);
	const [offline, setOffline] = useState(false);
	const applySession = useCallback((res) => {
		if (res.accessToken) setAccessToken(res.accessToken);
		setUserState(res.user);
		setSellerProfileState(res.sellerProfile ?? null);
		setOffline(false);
	}, []);
	useEffect(() => {
		let cancelled = false;
		api.auth.refresh().then((res) => !cancelled && applySession(res)).catch((err) => {
			if (cancelled) return;
			if (!(err instanceof ApiError)) setOffline(true);
		}).finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [applySession]);
	const login = useCallback(async (email, password) => {
		applySession(await api.auth.login({
			email,
			password
		}));
	}, [applySession]);
	const loginWithFirebase = useCallback(async (input) => {
		applySession(await api.auth.loginWithFirebase(input));
	}, [applySession]);
	const register = useCallback(async (input) => {
		applySession(await api.auth.register(input));
	}, [applySession]);
	const logout = useCallback(async () => {
		await api.auth.logout().catch(() => void 0);
		await signOutOfFirebase();
		setAccessToken(null);
		setUserState(null);
		setSellerProfileState(null);
	}, []);
	const reload = useCallback(async () => {
		const res = await api.auth.me().catch(() => null);
		if (res) applySession(res);
	}, [applySession]);
	const value = useMemo(() => ({
		user,
		sellerProfile,
		loading,
		offline,
		isSeller: user?.role === "seller" || user?.role === "admin",
		login,
		loginWithFirebase,
		register,
		logout,
		reload,
		setUser: setUserState,
		setSellerProfile: setSellerProfileState
	}), [
		user,
		sellerProfile,
		loading,
		offline,
		login,
		loginWithFirebase,
		register,
		logout,
		reload
	]);
	return /* @__PURE__ */ jsx(AuthContext.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
//#endregion
//#region src/lib/store.tsx
var Ctx = createContext(null);
function since(iso) {
	if (!iso) return "";
	const ms = Date.now() - new Date(iso).getTime();
	const min = Math.max(1, Math.floor(ms / 6e4));
	if (min < 60) return `${min} min ago`;
	const hrs = Math.floor(min / 60);
	if (hrs < 24) return `${hrs} hr ago`;
	const days = Math.floor(hrs / 24);
	return `${days} day${days > 1 ? "s" : ""} ago`;
}
function mapCart(input) {
	return (input?.items ?? []).map((raw) => {
		const row = raw;
		const product = row.product;
		const seller = row.seller;
		if (!product?._id || !product.slug) return null;
		const sellerId = typeof seller === "string" ? seller : seller?._id ?? "";
		if (!sellerId) return null;
		const offer = product.offers?.find((o) => {
			return (typeof o.seller === "string" ? o.seller : o.seller?._id ?? "") === sellerId;
		});
		return {
			productId: String(product._id),
			productSlug: String(product.slug),
			productName: String(product.name ?? "Product"),
			productNameBn: product.nameBn,
			productEmoji: product.emoji,
			productImage: product.image,
			sellerId,
			sellerName: typeof seller === "string" ? "Seller" : String(seller.name ?? "Seller"),
			sellerNameBn: typeof seller === "string" ? void 0 : seller.nameBn,
			delivery: offer?.delivery,
			qty: Math.max(1, Number(row.qty ?? 1)),
			price: Number(offer?.price ?? 0)
		};
	}).filter(Boolean);
}
function mapOrders(input) {
	return (input?.items ?? []).map((raw) => {
		const row = raw;
		return {
			id: String(row.code ?? ""),
			date: row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "",
			items: (row.items ?? []).map((it) => ({
				productId: String(it.product ?? ""),
				name: String(it.name ?? "Item"),
				emoji: it.emoji,
				qty: Number(it.qty ?? 1),
				price: Number(it.price ?? 0)
			})),
			total: Number(row.total ?? 0),
			payment: String(row.paymentMethod ?? "cod").toUpperCase(),
			status: String(row.status ?? "placed"),
			tracking: (row.tracking ?? []).map((t) => ({
				label: String(t.label ?? ""),
				labelBn: String(t.labelBn ?? ""),
				done: Boolean(t.done)
			}))
		};
	});
}
function mapNotifications(input) {
	return (input?.items ?? []).map((raw) => {
		const row = raw;
		return {
			id: String(row._id ?? ""),
			type: String(row.type ?? "system"),
			title: String(row.title ?? ""),
			titleBn: String(row.titleBn ?? row.title ?? ""),
			time: since(row.createdAt)
		};
	});
}
function StoreProvider({ children }) {
	const { user } = useAuth();
	const [cart, setCart] = useState([]);
	const [wishlist, setWishlist] = useState([]);
	const [orders, setOrders] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [coins, setCoins] = useState(0);
	const [viewed, setViewed] = useState([]);
	const reload = useCallback(async () => {
		if (!user) {
			setCart([]);
			setWishlist([]);
			setOrders([]);
			setNotifications([]);
			setCoins(0);
			return;
		}
		const [cartRes, ordersRes, notificationsRes, rewardsRes, wishlistRes] = await Promise.all([
			api.cart.get(),
			api.orders.list(),
			api.users.notifications(),
			api.rewards.me(),
			api.users.wishlist()
		]);
		setCart(mapCart(cartRes.cart));
		setOrders(mapOrders(ordersRes));
		setNotifications(mapNotifications(notificationsRes));
		setCoins(Number(rewardsRes.coins ?? user.coins ?? 0));
		const wishItems = wishlistRes.items ?? [];
		setWishlist(wishItems.map((p) => String(p._id ?? "")).filter(Boolean));
	}, [user]);
	useEffect(() => {
		reload();
	}, [reload]);
	const addToCart = useCallback(async (productSlug, sellerId, qty = 1) => {
		const res = await api.cart.add({
			productSlug,
			sellerId,
			qty
		});
		setCart(mapCart(res.cart));
	}, []);
	const setQty = useCallback(async (productId, qty) => {
		const existing = cart.find((line) => line.productId === productId);
		if (!existing) return;
		await api.cart.setQty({
			productId,
			sellerId: existing.sellerId,
			qty: Math.max(0, qty)
		});
		if (qty <= 0) {
			setCart((lines) => lines.filter((line) => line.productId !== productId));
			return;
		}
		setCart((lines) => lines.map((line) => line.productId === productId ? {
			...line,
			qty
		} : line));
	}, [cart]);
	const removeFromCart = useCallback(async (productId) => {
		await setQty(productId, 0);
	}, [setQty]);
	const clearCart = useCallback(async () => {
		await api.cart.clear();
		setCart([]);
	}, []);
	const toggleWishlist = useCallback(async (productId) => {
		await api.users.toggleWishlist(productId);
		const wishItems = (await api.users.wishlist()).items ?? [];
		setWishlist(wishItems.map((p) => String(p._id ?? "")).filter(Boolean));
	}, []);
	const markViewed = useCallback((productSlug) => {
		setViewed((v) => [productSlug, ...v.filter((x) => x !== productSlug)].slice(0, 8));
	}, []);
	const placeOrder = useCallback(async (paymentMethod, data) => {
		const res = await api.orders.checkout({
			paymentMethod,
			coinsToUse: data.coinsToUse ?? 0,
			address: {
				line1: data.line1,
				label: data.label,
				area: data.area,
				city: data.city,
				postcode: data.postcode
			}
		});
		const nextCoins = Number(res.coins ?? coins);
		setCoins(nextCoins);
		await reload();
		const order = res.order;
		return String(order?.code ?? "");
	}, [coins, reload]);
	const value = useMemo(() => ({
		cart,
		wishlist,
		orders,
		notifications,
		coins,
		viewed,
		addToCart,
		setQty,
		removeFromCart,
		clearCart,
		toggleWishlist,
		placeOrder,
		markViewed,
		reload
	}), [
		cart,
		wishlist,
		orders,
		notifications,
		coins,
		viewed,
		addToCart,
		setQty,
		removeFromCart,
		clearCart,
		toggleWishlist,
		placeOrder,
		markViewed,
		reload
	]);
	return /* @__PURE__ */ jsx(Ctx.Provider, {
		value,
		children
	});
}
function useStore() {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error("useStore must be used inside StoreProvider");
	return ctx;
}
var cartTotal = (cart) => cart.reduce((sum, line) => sum + line.price * line.qty, 0);
//#endregion
//#region src/routes/__root.tsx
function NotFoundComponent() {
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-6",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	useEffect(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ jsx("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ jsx("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$12 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "HyperLocal — Compare Local & Online Sellers in One Marketplace" },
			{
				name: "description",
				content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations."
			},
			{
				name: "author",
				content: "Lovable"
			},
			{
				property: "og:title",
				content: "HyperLocal — Compare Local & Online Sellers in One Marketplace"
			},
			{
				property: "og:description",
				content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			},
			{
				name: "twitter:title",
				content: "HyperLocal — Compare Local & Online Sellers in One Marketplace"
			},
			{
				name: "twitter:description",
				content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations."
			},
			{
				property: "og:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bd5343c2-b19a-430c-a400-35901ce87797/id-preview-4f3ec3dc--f2687fc9-2234-4bee-a25a-f202203245f1.lovable.app-1785512411002.png"
			},
			{
				name: "twitter:image",
				content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/bd5343c2-b19a-430c-a400-35901ce87797/id-preview-4f3ec3dc--f2687fc9-2234-4bee-a25a-f202203245f1.lovable.app-1785512411002.png"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [children, /* @__PURE__ */ jsx(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$12.useRouteContext();
	return /* @__PURE__ */ jsx(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ jsx(LanguageProvider, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(StoreProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }) }) })
	});
}
//#endregion
//#region src/lib/media/VoiceRecorder.ts
function getSpeechRecognitionCtor() {
	if (typeof window === "undefined") return null;
	const w = window;
	return w["SpeechRecognition"] ?? w["webkitSpeechRecognition"];
}
var SpeechRecognitionStrategy = class {
	name = "speech-api";
	recognition = null;
	transcript = "";
	language = "en-US";
	ended = Promise.resolve();
	isSupported() {
		return Boolean(getSpeechRecognitionCtor());
	}
	async start(language, onPartial) {
		const Ctor = getSpeechRecognitionCtor();
		if (!Ctor) throw new Error("Speech recognition is not supported in this browser");
		this.language = language;
		this.transcript = "";
		const recognition = new Ctor();
		recognition.lang = language;
		recognition.continuous = true;
		recognition.interimResults = true;
		this.ended = new Promise((resolve) => {
			recognition.onresult = (event) => {
				let text = "";
				for (let i = 0; i < event.results.length; i += 1) text += event.results[i]?.[0]?.transcript ?? "";
				this.transcript = text.trim();
				onPartial?.(this.transcript);
			};
			recognition.onerror = () => resolve();
			recognition.onend = () => resolve();
		});
		recognition.start();
		this.recognition = recognition;
	}
	async stop() {
		this.recognition?.stop();
		await Promise.race([this.ended, new Promise((r) => setTimeout(r, 1200))]);
		this.recognition = null;
		return {
			transcript: this.transcript,
			language: this.language
		};
	}
	cancel() {
		this.recognition?.abort();
		this.recognition = null;
	}
};
var MediaRecorderStrategy = class {
	name = "recorder";
	recorder = null;
	chunks = [];
	stream = null;
	language = "en-US";
	isSupported() {
		return typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices);
	}
	async start(language) {
		this.language = language;
		this.chunks = [];
		this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		const mimeType = [
			"audio/webm",
			"audio/mp4",
			"audio/ogg"
		].find((m) => MediaRecorder.isTypeSupported(m));
		this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : void 0);
		this.recorder.ondataavailable = (e) => e.data.size > 0 && this.chunks.push(e.data);
		this.recorder.start();
	}
	async stop() {
		const recorder = this.recorder;
		if (!recorder) return { language: this.language };
		const blob = await new Promise((resolve) => {
			recorder.onstop = () => resolve(new Blob(this.chunks, { type: recorder.mimeType || "audio/webm" }));
			recorder.stop();
		});
		this.release();
		return {
			audio: await blobToDataUrl(blob),
			mimeType: blob.type,
			language: this.language
		};
	}
	cancel() {
		try {
			this.recorder?.stop();
		} catch {}
		this.release();
	}
	release() {
		this.stream?.getTracks().forEach((t) => t.stop());
		this.stream = null;
		this.recorder = null;
	}
};
function blobToDataUrl(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read the recording"));
		reader.readAsDataURL(blob);
	});
}
/** Facade the UI uses. */
var VoiceRecorder = class {
	strategies;
	active = null;
	constructor(strategies = [new SpeechRecognitionStrategy(), new MediaRecorderStrategy()]) {
		this.strategies = strategies;
	}
	get supported() {
		return this.strategies.some((s) => s.isSupported());
	}
	get mode() {
		return this.active?.name ?? null;
	}
	async start(language, onPartial) {
		const strategy = this.strategies.find((s) => s.isSupported());
		if (!strategy) throw new Error("Microphone capture is not supported in this browser");
		this.active = strategy;
		await strategy.start(language, onPartial);
	}
	async stop() {
		const strategy = this.active;
		this.active = null;
		return strategy ? strategy.stop() : { language: "en-US" };
	}
	cancel() {
		this.active?.cancel();
		this.active = null;
	}
};
//#endregion
//#region src/lib/media/CameraCapture.ts
/**
* Camera capture for AI image product search.
*
* `CameraCapture` owns the getUserMedia stream and can grab a still frame as a
* compressed JPEG data URL, ready for the vision model. File uploads go
* through the same `ImageEncoder`, so both paths produce identical payloads.
*/
var ImageEncoder = class {
	maxSide;
	quality;
	constructor(maxSide = 1024, quality = .82) {
		this.maxSide = maxSide;
		this.quality = quality;
	}
	/** Downscales and re-encodes to a JPEG data URL (keeps requests small). */
	async fromSource(source, width, height) {
		const scale = Math.min(1, this.maxSide / Math.max(width, height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(width * scale);
		canvas.height = Math.round(height * scale);
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas is not available");
		ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
		return canvas.toDataURL("image/jpeg", this.quality);
	}
	async fromFile(file) {
		const bitmap = await createImageBitmap(file);
		try {
			return await this.fromSource(bitmap, bitmap.width, bitmap.height);
		} finally {
			bitmap.close();
		}
	}
};
var CameraCapture = class {
	encoder;
	stream = null;
	constructor(encoder = new ImageEncoder()) {
		this.encoder = encoder;
	}
	static get supported() {
		return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
	}
	async start(video) {
		this.stream = await navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: { ideal: "environment" },
				width: { ideal: 1280 }
			},
			audio: false
		});
		video.srcObject = this.stream;
		await video.play();
	}
	async capture(video) {
		return this.encoder.fromSource(video, video.videoWidth || 640, video.videoHeight || 480);
	}
	stop() {
		this.stream?.getTracks().forEach((t) => t.stop());
		this.stream = null;
	}
};
//#endregion
//#region src/components/SearchBar.tsx
function SearchBar() {
	const { t, lang } = useLang();
	const navigate = useNavigate();
	const [q, setQ] = useState("");
	const [modal, setModal] = useState(null);
	const go = useCallback((term) => {
		setModal(null);
		navigate({
			to: "/search",
			search: {
				q: term,
				category: void 0
			}
		});
	}, [navigate]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("form", {
		onSubmit: (e) => {
			e.preventDefault();
			go(q);
		},
		className: "flex w-full items-center gap-1 rounded-xl border border-border bg-card px-2 py-1.5 shadow-soft focus-within:ring-2 focus-within:ring-ring",
		children: [
			/* @__PURE__ */ jsx(Search, { className: "ml-1 size-4 shrink-0 text-muted-foreground" }),
			/* @__PURE__ */ jsx("input", {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: t("searchPlaceholder"),
				className: "min-w-0 flex-1 bg-transparent px-1 py-1 text-sm outline-none"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setModal("voice"),
				"aria-label": t("voiceSearch"),
				title: t("voiceSearch"),
				className: "rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary",
				children: /* @__PURE__ */ jsx(Mic, { className: "size-4" })
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setModal("visual"),
				"aria-label": t("visualSearch"),
				title: t("visualSearch"),
				className: "rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-primary",
				children: /* @__PURE__ */ jsx(Camera, { className: "size-4" })
			}),
			/* @__PURE__ */ jsx("button", {
				type: "submit",
				className: "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground",
				children: "Go"
			})
		]
	}), modal && /* @__PURE__ */ jsx("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4",
		onClick: () => setModal(null),
		children: /* @__PURE__ */ jsxs("div", {
			className: "card-surface w-full max-w-md p-5",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "font-display text-lg font-semibold",
					children: modal === "voice" ? t("voiceSearch") : t("visualSearch")
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => setModal(null),
					"aria-label": "Close",
					className: "rounded-md p-1 hover:bg-secondary",
					children: /* @__PURE__ */ jsx(X, { className: "size-4" })
				})]
			}), modal === "voice" ? /* @__PURE__ */ jsx(VoicePanel, {
				onResult: go,
				language: lang === "bn" ? "bn-BD" : "en-US"
			}) : /* @__PURE__ */ jsx(VisualPanel, { onResult: go })]
		})
	})] });
}
function ResultList({ items, onPick }) {
	if (!items.length) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-sm font-medium",
			children: [items.length, " matching products"]
		}), items.slice(0, 4).map((p) => /* @__PURE__ */ jsxs("button", {
			onClick: () => onPick(p.name),
			className: "flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left hover:bg-secondary",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary text-xl",
					children: p.image ? /* @__PURE__ */ jsx("img", {
						src: p.image,
						alt: "",
						className: "size-full object-cover"
					}) : p.emoji ?? "📦"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "flex-1 text-sm",
					children: p.name
				}),
				/* @__PURE__ */ jsxs("span", {
					className: "text-xs font-semibold text-primary",
					children: ["৳", p.price]
				})
			]
		}, p._id ?? p.slug))]
	});
}
/** Real microphone capture: Web Speech API when available, AI transcription otherwise. */
function VoicePanel({ onResult, language }) {
	const recorderRef = useRef(null);
	const [state, setState] = useState("idle");
	const [heard, setHeard] = useState("");
	const [items, setItems] = useState([]);
	const [error, setError] = useState(null);
	if (!recorderRef.current) recorderRef.current = new VoiceRecorder();
	const recorder = recorderRef.current;
	useEffect(() => () => recorder.cancel(), [recorder]);
	async function start() {
		setError(null);
		setHeard("");
		setItems([]);
		try {
			await recorder.start(language, setHeard);
			setState("listening");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Microphone unavailable");
		}
	}
	async function stop() {
		setState("working");
		try {
			const capture = await recorder.stop();
			const res = await api.ai.voiceSearch({
				...capture.transcript ? { transcript: capture.transcript } : {},
				...capture.audio ? {
					audio: capture.audio,
					mimeType: capture.mimeType
				} : {},
				language: capture.language
			});
			setHeard(res.transcript || capture.transcript || "");
			setItems(res.items ?? []);
			setState("done");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Voice search failed");
			setState(heard ? "done" : "idle");
		}
	}
	if (!recorder.supported) return /* @__PURE__ */ jsx("p", {
		className: "py-6 text-center text-sm text-muted-foreground",
		children: "This browser does not support microphone capture."
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center gap-4 py-2 text-center",
		children: [
			/* @__PURE__ */ jsx("button", {
				onClick: state === "listening" ? stop : start,
				disabled: state === "working",
				className: "flex size-20 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground shadow-lift disabled:opacity-60 " + (state === "listening" ? "animate-pulse" : ""),
				"aria-label": state === "listening" ? "Stop recording" : "Start recording",
				children: state === "working" ? /* @__PURE__ */ jsx(Loader2, { className: "size-8 animate-spin" }) : state === "listening" ? /* @__PURE__ */ jsx(Square, { className: "size-7" }) : /* @__PURE__ */ jsx(Mic, { className: "size-8" })
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-sm text-muted-foreground",
				children: [
					state === "idle" && "Tap the mic and speak in Bangla or English",
					state === "listening" && "Listening… tap again to search",
					state === "working" && "Transcribing with AI…",
					state === "done" && "Heard:"
				]
			}),
			heard && /* @__PURE__ */ jsxs("p", {
				className: "text-base font-medium",
				children: [
					"“",
					heard,
					"”"
				]
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ jsx(ResultList, {
				items,
				onPick: onResult
			}),
			state === "done" && heard && /* @__PURE__ */ jsxs("button", {
				onClick: () => onResult(heard),
				className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
				children: [
					"Search “",
					heard.slice(0, 28),
					"”"
				]
			})
		]
	});
}
/** Real camera / photo capture sent to the backend vision model. */
function VisualPanel({ onResult }) {
	const videoRef = useRef(null);
	const cameraRef = useRef(null);
	const encoderRef = useRef(new ImageEncoder());
	const [mode, setMode] = useState("idle");
	const [preview, setPreview] = useState(null);
	const [labels, setLabels] = useState([]);
	const [description, setDescription] = useState("");
	const [items, setItems] = useState([]);
	const [error, setError] = useState(null);
	if (!cameraRef.current) cameraRef.current = new CameraCapture(encoderRef.current);
	const camera = cameraRef.current;
	useEffect(() => () => camera.stop(), [camera]);
	async function openCamera() {
		setError(null);
		setMode("camera");
		try {
			await new Promise((r) => requestAnimationFrame(r));
			if (videoRef.current) await camera.start(videoRef.current);
		} catch {
			setError("Camera permission denied — upload a photo instead.");
			setMode("idle");
		}
	}
	async function analyse(dataUrl) {
		setPreview(dataUrl);
		setMode("analysing");
		setError(null);
		try {
			const res = await api.ai.imageSearch({
				image: dataUrl,
				limit: 8
			});
			setLabels(res.labels ?? []);
			setDescription(res.description ?? "");
			setItems(res.items ?? []);
			if (res.warning) setError(res.warning);
			setMode("done");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Image search failed");
			setMode("done");
		}
	}
	async function shoot() {
		if (!videoRef.current) return;
		const shot = await camera.capture(videoRef.current);
		camera.stop();
		analyse(shot);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-4",
		children: [
			mode === "idle" && /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("label", {
					className: "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 px-4 py-8 text-center hover:bg-secondary",
					children: [
						/* @__PURE__ */ jsx(Upload, { className: "size-6 text-primary" }),
						/* @__PURE__ */ jsx("span", {
							className: "text-sm font-medium",
							children: "Upload a product photo"
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-xs text-muted-foreground",
							children: "JPG, PNG or WebP"
						}),
						/* @__PURE__ */ jsx("input", {
							type: "file",
							accept: "image/*",
							className: "hidden",
							onChange: async (e) => {
								const f = e.target.files?.[0];
								if (f) analyse(await encoderRef.current.fromFile(f));
							}
						})
					]
				}),
				CameraCapture.supported && /* @__PURE__ */ jsxs("button", {
					onClick: openCamera,
					className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-medium hover:bg-secondary",
					children: [/* @__PURE__ */ jsx(Camera, { className: "size-4" }), " Use camera"]
				}),
				error && /* @__PURE__ */ jsx("p", {
					className: "text-sm text-destructive",
					children: error
				})
			] }),
			mode === "camera" && /* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ jsx("video", {
					ref: videoRef,
					playsInline: true,
					muted: true,
					className: "h-56 w-full rounded-xl bg-secondary object-cover"
				}), /* @__PURE__ */ jsx("button", {
					onClick: shoot,
					className: "w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground",
					children: "Capture & identify"
				})]
			}),
			(mode === "analysing" || mode === "done") && /* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ jsx("div", {
					className: "flex h-32 items-center justify-center overflow-hidden rounded-xl bg-secondary",
					children: preview ? /* @__PURE__ */ jsx("img", {
						src: preview,
						alt: "Captured item",
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ jsx("span", {
						className: "text-4xl",
						children: "📷"
					})
				}), mode === "analysing" ? /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), " AI is identifying the product…"]
				}) : /* @__PURE__ */ jsxs("div", {
					className: "space-y-3",
					children: [
						description && /* @__PURE__ */ jsxs("p", {
							className: "flex gap-2 rounded-lg bg-secondary/60 p-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsx(Sparkles, { className: "size-3.5 shrink-0 text-primary" }),
								" ",
								description
							]
						}),
						labels.length > 0 && /* @__PURE__ */ jsx("div", {
							className: "flex flex-wrap gap-1.5",
							children: labels.map((l) => /* @__PURE__ */ jsx("button", {
								onClick: () => onResult(l),
								className: "rounded-full border border-border px-2.5 py-1 text-[11px] font-medium hover:bg-secondary",
								children: l
							}, l))
						}),
						/* @__PURE__ */ jsx(ResultList, {
							items,
							onPick: onResult
						}),
						error && /* @__PURE__ */ jsx("p", {
							className: "text-xs text-destructive",
							children: error
						}),
						!items.length && !error && /* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: "No matching listings found."
						})
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/components/AssistantWidget.tsx
var suggestions = [
	"Compare the two cheapest headphone offers",
	"Where is my latest order?",
	"Suggest a gift under ৳2000",
	"Are the reviews on the serum trustworthy?"
];
function AssistantWidget() {
	const { t } = useLang();
	const [open, setOpen] = useState(false);
	const [input, setInput] = useState("");
	const [typing, setTyping] = useState(false);
	const [msgs, setMsgs] = useState([{
		role: "assistant",
		text: "Salam! I'm your HyperLocal assistant. Ask me to compare sellers, track an order, or find something within your budget."
	}]);
	const endRef = useRef(null);
	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [
		msgs,
		typing,
		open
	]);
	const send = (text) => {
		if (!text.trim()) return;
		setMsgs((m) => [...m, {
			role: "user",
			text
		}]);
		setInput("");
		setTyping(true);
		api.ai.assistant(text).then((res) => {
			setMsgs((m) => [...m, {
				role: "assistant",
				text: res.reply || "No response from assistant.",
				chips: [{
					label: "Browse products",
					to: "/search"
				}]
			}]);
		}).catch((err) => {
			setMsgs((m) => [...m, {
				role: "assistant",
				text: err instanceof Error ? err.message : "Assistant is unavailable right now."
			}]);
		}).finally(() => setTyping(false));
	};
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("button", {
		onClick: () => setOpen((o) => !o),
		className: "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-hero-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition-transform hover:scale-105",
		children: [open ? /* @__PURE__ */ jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsx(Bot, { className: "size-5" }), /* @__PURE__ */ jsx("span", {
			className: "hidden sm:inline",
			children: t("assistant")
		})]
	}), open && /* @__PURE__ */ jsxs("div", {
		className: "fixed bottom-24 right-5 z-50 flex h-130 w-[min(92vw,380px)] flex-col overflow-hidden card-surface shadow-lift",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2 bg-hero-gradient px-4 py-3 text-primary-foreground",
				children: [/* @__PURE__ */ jsx(Bot, { className: "size-5" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "text-sm font-semibold",
					children: t("assistant")
				}), /* @__PURE__ */ jsx("div", {
					className: "text-[11px] opacity-80",
					children: "Live backend assistant"
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex-1 space-y-3 overflow-y-auto p-3",
				children: [
					msgs.map((m, i) => /* @__PURE__ */ jsx("div", {
						className: m.role === "user" ? "flex justify-end" : "",
						children: /* @__PURE__ */ jsxs("div", {
							className: m.role === "user" ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground" : "max-w-[92%] text-sm leading-relaxed text-foreground",
							children: [m.text, m.chips && /* @__PURE__ */ jsx("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: m.chips.map((c) => /* @__PURE__ */ jsx(Link, {
									to: c.to,
									params: c.params,
									onClick: () => setOpen(false),
									className: "rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-accent hover:text-accent-foreground",
									children: c.label
								}, c.label))
							})]
						})
					}, i)),
					typing && /* @__PURE__ */ jsx("div", {
						className: "animate-pulse text-sm text-muted-foreground",
						children: "Thinking…"
					}),
					/* @__PURE__ */ jsx("div", { ref: endRef })
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex flex-wrap gap-1.5 border-t border-border px-3 pt-2",
				children: suggestions.map((s) => /* @__PURE__ */ jsx("button", {
					onClick: () => send(s),
					className: "rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-secondary",
					children: s
				}, s))
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit: (e) => {
					e.preventDefault();
					send(input);
				},
				className: "flex items-center gap-2 p-3",
				children: [/* @__PURE__ */ jsx("input", {
					value: input,
					onChange: (e) => setInput(e.target.value),
					placeholder: "Ask anything…",
					className: "flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "rounded-lg bg-primary p-2 text-primary-foreground",
					"aria-label": "Send",
					children: /* @__PURE__ */ jsx(Send, { className: "size-4" })
				})]
			})
		]
	})] });
}
//#endregion
//#region src/components/Layout.tsx
var navItems = [
	{
		to: "/",
		key: "home",
		icon: Home
	},
	{
		to: "/search",
		key: "categories",
		icon: Store
	},
	{
		to: "/orders",
		key: "orders",
		icon: Package
	},
	{
		to: "/rewards",
		key: "rewards",
		icon: Coins
	},
	{
		to: "/seller",
		key: "seller",
		icon: Store
	},
	{
		to: "/profile",
		key: "profile",
		icon: User
	}
];
function Layout({ children }) {
	const { lang, setLang, t } = useLang();
	const { cart, wishlist, notifications, coins } = useStore();
	const { user, logout } = useAuth();
	const [bellOpen, setBellOpen] = useState(false);
	const path = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ jsxs(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "flex size-9 items-center justify-center rounded-xl bg-hero-gradient text-lg text-primary-foreground",
								children: "🛍️"
							}), /* @__PURE__ */ jsxs("span", {
								className: "font-display text-lg font-bold leading-none",
								children: [t("brand"), /* @__PURE__ */ jsx("span", {
									className: "block text-[10px] font-medium text-muted-foreground",
									children: "Aggregator Platform"
								})]
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "order-3 w-full md:order-2 md:w-auto md:flex-1 md:px-4",
							children: /* @__PURE__ */ jsx(SearchBar, {})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "order-2 ml-auto flex items-center gap-1 md:order-3 md:ml-0",
							children: [
								/* @__PURE__ */ jsxs("button", {
									onClick: () => setLang(lang === "en" ? "bn" : "en"),
									className: "flex items-center gap-1 rounded-lg border border-border px-2 py-1.5 text-xs font-semibold hover:bg-secondary",
									title: "Switch language",
									children: [
										/* @__PURE__ */ jsx(Languages, { className: "size-4" }),
										" ",
										lang === "en" ? "বাংলা" : "EN"
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "relative",
									children: [/* @__PURE__ */ jsxs("button", {
										onClick: () => setBellOpen((o) => !o),
										"aria-label": t("notifications"),
										className: "relative rounded-lg p-2 hover:bg-secondary",
										children: [/* @__PURE__ */ jsx(Bell, { className: "size-5" }), /* @__PURE__ */ jsx("span", { className: "absolute right-1 top-1 size-2 rounded-full bg-destructive" })]
									}), bellOpen && /* @__PURE__ */ jsxs("div", {
										className: "absolute right-0 mt-2 w-80 card-surface p-2",
										children: [/* @__PURE__ */ jsx("div", {
											className: "px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
											children: t("notifications")
										}), /* @__PURE__ */ jsx("div", {
											className: "max-h-80 overflow-y-auto",
											children: notifications.map((n) => /* @__PURE__ */ jsxs("div", {
												className: "flex gap-2 rounded-lg p-2 hover:bg-secondary",
												children: [/* @__PURE__ */ jsx("span", {
													className: "text-lg",
													children: n.type === "order" ? "📦" : n.type === "price" ? "📉" : n.type === "reward" ? "🪙" : "⚡"
												}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
													className: "text-sm leading-snug",
													children: lang === "bn" ? n.titleBn : n.title
												}), /* @__PURE__ */ jsx("p", {
													className: "text-[11px] text-muted-foreground",
													children: n.time
												})] })]
											}, n.id))
										})]
									})]
								}),
								/* @__PURE__ */ jsxs(Link, {
									to: "/wishlist",
									className: "relative rounded-lg p-2 hover:bg-secondary",
									"aria-label": t("wishlist"),
									children: [/* @__PURE__ */ jsx(Heart, { className: "size-5" }), wishlist.length > 0 && /* @__PURE__ */ jsx(Badge, { children: wishlist.length })]
								}),
								/* @__PURE__ */ jsxs(Link, {
									to: "/cart",
									className: "relative rounded-lg p-2 hover:bg-secondary",
									"aria-label": t("cart"),
									children: [/* @__PURE__ */ jsx(ShoppingCart, { className: "size-5" }), cart.length > 0 && /* @__PURE__ */ jsx(Badge, { children: cart.length })]
								}),
								/* @__PURE__ */ jsxs(Link, {
									to: "/rewards",
									className: "hidden items-center gap-1 rounded-lg bg-accent-gradient px-2.5 py-1.5 text-xs font-bold text-accent-foreground sm:flex",
									children: [
										/* @__PURE__ */ jsx(Coins, { className: "size-4" }),
										" ",
										coins
									]
								}),
								user ? /* @__PURE__ */ jsxs("button", {
									onClick: () => void logout(),
									className: "rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary",
									title: user.email,
									children: [user.name.split(" ")[0], " · Sign out"]
								}) : /* @__PURE__ */ jsx(Link, {
									to: "/login",
									search: { redirect: void 0 },
									className: "rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary",
									children: "Sign in"
								})
							]
						})
					]
				}), /* @__PURE__ */ jsx("nav", {
					className: "mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 text-sm",
					children: navItems.map((item) => {
						const active = item.to === "/" ? path === "/" : path.startsWith(item.to);
						const Icon = item.icon;
						return /* @__PURE__ */ jsxs(Link, {
							to: item.to,
							className: "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors " + (active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"),
							children: [/* @__PURE__ */ jsx(Icon, { className: "size-4" }), t(item.key)]
						}, item.to + item.key);
					})
				})]
			}),
			/* @__PURE__ */ jsx("main", {
				className: "mx-auto max-w-7xl px-4 py-6",
				children
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "mt-12 border-t border-border bg-card",
				children: /* @__PURE__ */ jsxs("div", {
					className: "mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-display text-base font-semibold text-foreground",
							children: t("brand")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 max-w-lg",
							children: t("tagline")
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-xs",
							children: "Data is loaded from the backend API."
						})
					]
				})
			}),
			/* @__PURE__ */ jsx(AssistantWidget, {})
		]
	});
}
function Badge({ children }) {
	return /* @__PURE__ */ jsx("span", {
		className: "absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground",
		children
	});
}
//#endregion
//#region src/components/ProductCard.tsx
function sellerFromOffer(offer) {
	return typeof offer.seller === "string" ? null : offer.seller;
}
function sellerIdFromOffer(offer) {
	return typeof offer.seller === "string" ? offer.seller : offer.seller._id;
}
function ProductCard({ product, reason }) {
	const { lang, t } = useLang();
	const { wishlist, toggleWishlist, addToCart } = useStore();
	const saved = wishlist.includes(product._id);
	const best = [...product.offers].sort((a, b) => a.price - b.price)[0];
	const seller = sellerFromOffer(best);
	const sellerId = sellerIdFromOffer(best);
	return /* @__PURE__ */ jsxs("div", {
		className: "group card-surface flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lift",
		children: [/* @__PURE__ */ jsxs(Link, {
			to: "/product/$productId",
			params: { productId: product.slug },
			className: "relative block",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex h-40 items-center justify-center text-5xl",
				style: product.image ? { backgroundImage: product.image } : void 0,
				"aria-hidden": true,
				children: product.emoji ?? "📦"
			}), product.oldPrice && /* @__PURE__ */ jsxs("span", {
				className: "absolute left-3 top-3 rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground",
				children: [
					"-",
					Math.round((1 - product.price / product.oldPrice) * 100),
					"%"
				]
			})]
		}), /* @__PURE__ */ jsxs("div", {
			className: "flex flex-1 flex-col gap-2 p-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/product/$productId",
						params: { productId: product.slug },
						className: "line-clamp-2 text-sm font-semibold leading-snug hover:text-primary",
						children: lang === "bn" && product.nameBn ? product.nameBn : product.name
					}), /* @__PURE__ */ jsx("button", {
						onClick: () => void toggleWishlist(product._id),
						"aria-label": "wishlist",
						className: "shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive",
						children: /* @__PURE__ */ jsx(Heart, { className: "size-4 " + (saved ? "fill-destructive text-destructive" : "") })
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ jsx(Star, { className: "size-3.5 fill-accent text-accent" }),
						product.rating,
						" · ",
						product.reviewCount,
						" ",
						t("reviews")
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center gap-1 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }), /* @__PURE__ */ jsx("span", {
						className: "truncate",
						children: seller ? lang === "bn" && seller.nameBn ? seller.nameBn : seller.name : "Seller"
					})]
				}),
				reason && /* @__PURE__ */ jsx("p", {
					className: "rounded-md bg-secondary px-2 py-1 text-[11px] leading-snug text-secondary-foreground",
					children: reason
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-auto flex items-end justify-between pt-2",
					children: [/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("div", {
							className: "font-display text-lg font-bold",
							children: money(best.price, lang)
						}),
						product.oldPrice && /* @__PURE__ */ jsx("div", {
							className: "text-xs text-muted-foreground line-through",
							children: money(product.oldPrice, lang)
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-[11px] text-muted-foreground",
							children: [
								product.offers.length,
								" sellers from ",
								money(best.price, lang)
							]
						})
					] }), /* @__PURE__ */ jsx("button", {
						onClick: () => void addToCart(product.slug, sellerId),
						className: "rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90",
						children: t("addToCart")
					})]
				})
			]
		})]
	});
}
//#endregion
//#region src/lib/hooks/useAsync.ts
/**
* Small read-model hook: runs an async loader and exposes {data, loading, error}.
* Keeps route components free of fetch/effect plumbing (SRP).
*/
function useAsync(loader, deps = [], enabled = true) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(enabled);
	const [error, setError] = useState(null);
	const [nonce, setNonce] = useState(0);
	const run = useCallback(loader, deps);
	useEffect(() => {
		if (!enabled) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		setError(null);
		run().then((res) => !cancelled && setData(res)).catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Request failed")).finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [
		run,
		enabled,
		nonce
	]);
	return {
		data,
		loading,
		error,
		reload: () => setNonce((n) => n + 1),
		setData
	};
}
//#endregion
//#region src/routes/index.tsx
var Route$11 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "HyperLocal — Compare Local & Online Sellers in One Marketplace" },
		{
			name: "description",
			content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations."
		},
		{
			property: "og:title",
			content: "HyperLocal — Compare Local & Online Sellers in One Marketplace"
		},
		{
			property: "og:description",
			content: "AI-powered hyperlocal marketplace: compare vendor prices, use visual and voice search, and get personalised recommendations."
		}
	] }),
	component: Index
});
function Index() {
	const { lang, t } = useLang();
	const { viewed, wishlist } = useStore();
	const categories = useAsync(() => api.products.categories(), [], true);
	const recos = useAsync(() => api.products.recommendations(), [wishlist.join(","), viewed.join(",")], true);
	const trending = useAsync(() => api.products.list({
		sort: "rating",
		page: 1,
		limit: 4
	}), [], true);
	return /* @__PURE__ */ jsxs(Layout, { children: [
		/* @__PURE__ */ jsxs("section", {
			className: "overflow-hidden rounded-3xl bg-hero-gradient p-8 text-primary-foreground shadow-lift md:p-12",
			children: [
				/* @__PURE__ */ jsxs("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold",
					children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-3.5" }), " AI-powered · Bangla & English"]
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-5xl",
					children: lang === "bn" ? "পাড়ার দোকান আর অনলাইন সেলার — এক জায়গায়" : "Every shop near you, and every online seller, in one place"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-3 max-w-xl text-sm opacity-90 md:text-base",
					children: t("tagline")
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-6 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ jsx(Link, {
						to: "/search",
						search: {
							q: "",
							category: void 0
						},
						className: "rounded-xl bg-accent-gradient px-5 py-2.5 text-sm font-bold text-accent-foreground",
						children: lang === "bn" ? "কেনাকাটা শুরু করুন" : "Start shopping"
					}), /* @__PURE__ */ jsx(Link, {
						to: "/seller",
						className: "rounded-xl border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold",
						children: lang === "bn" ? "বিক্রেতা ড্যাশবোর্ড" : "Seller dashboard"
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "mt-8 grid gap-3 sm:grid-cols-3",
					children: [
						{
							icon: Camera,
							label: t("visualSearch"),
							sub: "Upload a photo, find the item"
						},
						{
							icon: Mic,
							label: t("voiceSearch"),
							sub: "Speak in Bangla or English"
						},
						{
							icon: ShieldCheck,
							label: "Fake review detection",
							sub: "Ratings you can trust"
						}
					].map((f) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-2xl bg-primary-foreground/10 p-4",
						children: [
							/* @__PURE__ */ jsx(f.icon, { className: "size-5" }),
							/* @__PURE__ */ jsx("p", {
								className: "mt-2 text-sm font-semibold",
								children: f.label
							}),
							/* @__PURE__ */ jsx("p", {
								className: "text-xs opacity-80",
								children: f.sub
							})
						]
					}, f.label))
				})
			]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-8",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-xl font-bold",
				children: t("categories")
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6",
				children: (categories.data?.items ?? []).map((c) => /* @__PURE__ */ jsx(Link, {
					to: "/search",
					search: {
						q: "",
						category: c
					},
					className: "card-surface flex flex-col items-center gap-1 p-4 text-center transition-transform hover:-translate-y-1",
					children: /* @__PURE__ */ jsx("span", {
						className: "text-xs font-semibold",
						children: c
					})
				}, c))
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex items-end justify-between",
				children: /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display text-xl font-bold",
					children: t("recommended")
				}), /* @__PURE__ */ jsx("p", {
					className: "text-xs text-muted-foreground",
					children: lang === "bn" ? "ব্রাউজিং, উইশলিস্ট, বাজেট ও মৌসুমি ট্রেন্ড থেকে তৈরি" : `Built from ${viewed.length} recently viewed items, ${wishlist.length} wishlist saves, your budget band and seasonal trends`
				})] })
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: (recos.data?.items ?? []).map((p) => /* @__PURE__ */ jsx(ProductCard, {
					product: p,
					reason: lang === "bn" ? "আপনার কার্যকলাপের উপর ভিত্তি করে" : "Based on your activity"
				}, p._id))
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ jsxs("h2", {
				className: "flex items-center gap-2 font-display text-xl font-bold",
				children: [
					/* @__PURE__ */ jsx(Zap, { className: "size-5 text-accent" }),
					" ",
					t("trending")
				]
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: (trending.data?.items ?? []).map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p._id))
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-10 grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "card-surface p-6",
				children: [/* @__PURE__ */ jsx("h3", {
					className: "font-display text-lg font-bold",
					children: lang === "bn" ? "সব ফিচার দেখুন" : "Every feature in this prototype"
				}), /* @__PURE__ */ jsx("ul", {
					className: "mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2",
					children: [
						"AI shopping assistant",
						"Personalised recommendations",
						"Visual search",
						"Voice search",
						"Review summary + fake detection",
						"Multiple payment methods",
						"Live order tracking",
						"Cart & wishlist",
						"Product details & seller compare",
						"Search, filters & categories",
						"User & seller profiles",
						"Rewards, coins & coupons",
						"Push notifications",
						"Bangla / English switch"
					].map((f) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ jsx("span", { className: "size-1.5 rounded-full bg-primary" }),
							" ",
							f
						]
					}, f))
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "card-surface flex flex-col justify-center gap-3 bg-secondary/60 p-6",
				children: [
					/* @__PURE__ */ jsx("h3", {
						className: "font-display text-lg font-bold",
						children: lang === "bn" ? "স্থানীয় বিক্রেতাদের সাপোর্ট করুন" : "Backing local businesses"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "Local shops appear beside national retailers with same-day delivery, verified badges and transparent price comparison — so neighbourhood sellers compete on service, not just ad budget."
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-4 text-center",
						children: [
							["1,240", "local sellers"],
							["18.4k", "listings"],
							["96%", "on-time delivery"]
						].map(([v, l]) => /* @__PURE__ */ jsxs("div", {
							className: "flex-1 rounded-xl bg-card p-3",
							children: [/* @__PURE__ */ jsx("div", {
								className: "font-display text-xl font-bold text-primary",
								children: v
							}), /* @__PURE__ */ jsx("div", {
								className: "text-[11px] text-muted-foreground",
								children: l
							})]
						}, l))
					})
				]
			})]
		})
	] });
}
//#endregion
//#region src/routes/cart.tsx
var Route$10 = createFileRoute("/cart")({
	head: () => ({ meta: [
		{ title: "Your cart — HyperLocal" },
		{
			name: "description",
			content: "Review items from multiple sellers, update quantities and continue to checkout."
		},
		{
			property: "og:title",
			content: "Your cart — HyperLocal"
		},
		{
			property: "og:description",
			content: "Multi-vendor cart with per-seller delivery estimates."
		}
	] }),
	component: CartPage
});
function CartPage() {
	const { lang, t } = useLang();
	const { cart, setQty, removeFromCart, toggleWishlist } = useStore();
	const subtotal = cartTotal(cart);
	const delivery = cart.length ? 60 : 0;
	return /* @__PURE__ */ jsxs(Layout, { children: [/* @__PURE__ */ jsx("h1", {
		className: "font-display text-2xl font-bold",
		children: t("cart")
	}), cart.length === 0 ? /* @__PURE__ */ jsxs("div", {
		className: "card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center",
		children: [
			/* @__PURE__ */ jsx(ShoppingCart, { className: "size-10 text-muted-foreground" }),
			/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: t("emptyCart")
			}),
			/* @__PURE__ */ jsx(Link, {
				to: "/search",
				search: {
					q: "",
					category: void 0
				},
				className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
				children: "Browse products"
			})
		]
	}) : /* @__PURE__ */ jsxs("div", {
		className: "mt-4 grid gap-6 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children: cart.map((line) => {
				return /* @__PURE__ */ jsxs("div", {
					className: "card-surface flex gap-3 p-3",
					children: [
						/* @__PURE__ */ jsx(Link, {
							to: "/product/$productId",
							params: { productId: line.productSlug },
							className: "flex size-20 shrink-0 items-center justify-center rounded-xl text-3xl",
							style: line.productImage ? { backgroundImage: line.productImage } : void 0,
							children: line.productEmoji ?? "📦"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1",
							children: [
								/* @__PURE__ */ jsx(Link, {
									to: "/product/$productId",
									params: { productId: line.productSlug },
									className: "text-sm font-semibold hover:text-primary",
									children: lang === "bn" && line.productNameBn ? line.productNameBn : line.productName
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-[11px] text-muted-foreground",
									children: [lang === "bn" && line.sellerNameBn ? line.sellerNameBn : line.sellerName, line.delivery ? ` · ${line.delivery}` : ""]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex items-center gap-2",
									children: [
										/* @__PURE__ */ jsxs("div", {
											className: "flex items-center rounded-lg border border-border",
											children: [
												/* @__PURE__ */ jsx("button", {
													onClick: () => void setQty(line.productId, line.qty - 1),
													className: "p-1.5 hover:bg-secondary",
													"aria-label": "Decrease",
													children: /* @__PURE__ */ jsx(Minus, { className: "size-3.5" })
												}),
												/* @__PURE__ */ jsx("span", {
													className: "w-8 text-center text-sm",
													children: line.qty
												}),
												/* @__PURE__ */ jsx("button", {
													onClick: () => void setQty(line.productId, line.qty + 1),
													className: "p-1.5 hover:bg-secondary",
													"aria-label": "Increase",
													children: /* @__PURE__ */ jsx(Plus, { className: "size-3.5" })
												})
											]
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => void toggleWishlist(line.productId),
											className: "text-xs text-primary underline",
											children: "Save for later"
										}),
										/* @__PURE__ */ jsx("button", {
											onClick: () => void removeFromCart(line.productId),
											className: "ml-auto rounded-lg p-1.5 text-destructive hover:bg-destructive/10",
											"aria-label": "Remove",
											children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
										})
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "font-display font-bold",
							children: money(line.price * line.qty, lang)
						})
					]
				}, line.productId);
			})
		}), /* @__PURE__ */ jsxs("aside", {
			className: "card-surface h-fit space-y-3 p-4",
			children: [
				/* @__PURE__ */ jsx("h2", {
					className: "font-display font-bold",
					children: "Order summary"
				}),
				/* @__PURE__ */ jsx(Row, {
					label: "Subtotal",
					value: money(subtotal, lang)
				}),
				/* @__PURE__ */ jsx(Row, {
					label: "Delivery",
					value: money(delivery, lang)
				}),
				/* @__PURE__ */ jsx(Row, {
					label: "Coin discount",
					value: "-" + money(0, lang)
				}),
				/* @__PURE__ */ jsx("div", {
					className: "border-t border-border pt-3",
					children: /* @__PURE__ */ jsx(Row, {
						label: t("total"),
						value: money(subtotal + delivery, lang),
						bold: true
					})
				}),
				/* @__PURE__ */ jsx(Link, {
					to: "/checkout",
					className: "block rounded-xl bg-primary py-3 text-center text-sm font-bold text-primary-foreground",
					children: t("checkout")
				})
			]
		})]
	})] });
}
function Row({ label, value, bold }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex justify-between text-sm " + (bold ? "font-display text-base font-bold" : "text-muted-foreground"),
		children: [/* @__PURE__ */ jsx("span", { children: label }), /* @__PURE__ */ jsx("span", {
			className: bold ? "" : "text-foreground",
			children: value
		})]
	});
}
//#endregion
//#region src/routes/checkout.tsx
var methods = [
	{
		id: "cod",
		label: "Cash on Delivery",
		labelBn: "ক্যাশ অন ডেলিভারি",
		icon: Banknote,
		note: "Pay the rider on arrival"
	},
	{
		id: "card",
		label: "Credit / Debit card",
		labelBn: "কার্ড",
		icon: CreditCard,
		note: "Visa, Mastercard, Amex"
	},
	{
		id: "bkash",
		label: "Mobile banking",
		labelBn: "মোবাইল ব্যাংকিং",
		icon: Smartphone,
		note: "bKash, Nagad, Rocket"
	},
	{
		id: "wallet",
		label: "Digital wallet",
		labelBn: "ডিজিটাল ওয়ালেট",
		icon: Wallet,
		note: "HyperLocal wallet balance ৳1,820"
	}
];
var Route$9 = createFileRoute("/checkout")({
	head: () => ({ meta: [
		{ title: "Checkout — HyperLocal" },
		{
			name: "description",
			content: "Pay with cash on delivery, card, mobile banking or digital wallet."
		},
		{
			property: "og:title",
			content: "Checkout — HyperLocal"
		},
		{
			property: "og:description",
			content: "Multiple payment methods with coin redemption at checkout."
		}
	] }),
	component: CheckoutPage
});
function CheckoutPage() {
	const { lang, t } = useLang();
	const navigate = useNavigate();
	const { cart, placeOrder, coins } = useStore();
	const [method, setMethod] = useState("cod");
	const [useCoins, setUseCoins] = useState(false);
	const [placed, setPlaced] = useState(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const subtotal = cartTotal(cart);
	const delivery = cart.length ? 60 : 0;
	const coinDiscount = useCoins ? Math.min(coins, 500) : 0;
	const total = Math.max(0, subtotal + delivery - coinDiscount);
	const submit = async () => {
		if (!cart.length) return;
		setBusy(true);
		setError(null);
		try {
			const id = await placeOrder(method, {
				line1: "House 14, Road 9/A, Flat 3B",
				area: "Dhanmondi",
				city: "Dhaka",
				label: "Home",
				coinsToUse: useCoins ? coinDiscount : 0
			});
			setPlaced(id);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Checkout failed");
		} finally {
			setBusy(false);
		}
	};
	if (placed) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "card-surface mx-auto mt-10 max-w-lg p-8 text-center",
		children: [
			/* @__PURE__ */ jsx(CheckCircle2, { className: "mx-auto size-12 text-success" }),
			/* @__PURE__ */ jsx("h1", {
				className: "mt-3 font-display text-2xl font-bold",
				children: "Order placed"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					"Order ",
					/* @__PURE__ */ jsxs("strong", { children: ["#", placed] }),
					" is confirmed. A push notification was sent with tracking details."
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-5 flex justify-center gap-2",
				children: [/* @__PURE__ */ jsx(Link, {
					to: "/orders",
					className: "rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground",
					children: t("trackOrder")
				}), /* @__PURE__ */ jsx("button", {
					onClick: () => navigate({ to: "/" }),
					className: "rounded-xl border border-border px-4 py-2 text-sm font-semibold",
					children: "Keep shopping"
				})]
			})
		]
	}) });
	return /* @__PURE__ */ jsxs(Layout, { children: [/* @__PURE__ */ jsx("h1", {
		className: "font-display text-2xl font-bold",
		children: t("checkout")
	}), /* @__PURE__ */ jsxs("div", {
		className: "mt-4 grid gap-6 lg:grid-cols-[1fr_340px]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ jsxs("section", {
				className: "card-surface p-4",
				children: [/* @__PURE__ */ jsx("h2", {
					className: "font-display font-bold",
					children: "Delivery address"
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ jsx(Field$1, {
							label: "Full name",
							value: "Ayesha Rahman"
						}),
						/* @__PURE__ */ jsx(Field$1, {
							label: "Phone",
							value: "+880 1712 345678"
						}),
						/* @__PURE__ */ jsx(Field$1, {
							label: "Area",
							value: "Dhanmondi 27, Dhaka"
						}),
						/* @__PURE__ */ jsx(Field$1, {
							label: "Address",
							value: "House 14, Road 9/A, Flat 3B"
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("section", {
				className: "card-surface p-4",
				children: [
					/* @__PURE__ */ jsx("h2", {
						className: "font-display font-bold",
						children: "Payment method"
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-2",
						children: methods.map((m) => /* @__PURE__ */ jsxs("button", {
							onClick: () => setMethod(m.id),
							className: "flex items-start gap-3 rounded-xl border p-3 text-left " + (method === m.id ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"),
							children: [/* @__PURE__ */ jsx(m.icon, { className: "mt-0.5 size-5 text-primary" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
								className: "text-sm font-semibold",
								children: lang === "bn" ? m.labelBn : m.label
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-muted-foreground",
								children: m.note
							})] })]
						}, m.id))
					}),
					method === "card" && /* @__PURE__ */ jsxs("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-3",
						children: [/* @__PURE__ */ jsx(Field$1, {
							label: "Card number",
							value: "4242 4242 4242 4242",
							span: true
						}), /* @__PURE__ */ jsx(Field$1, {
							label: "Expiry",
							value: "09/29"
						})]
					}),
					method === "bkash" && /* @__PURE__ */ jsxs("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ jsx(Field$1, {
							label: "bKash number",
							value: "+880 1712 345678"
						}), /* @__PURE__ */ jsx(Field$1, {
							label: "OTP",
							value: "••••"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ jsxs("aside", {
			className: "card-surface h-fit space-y-3 p-4",
			children: [
				/* @__PURE__ */ jsxs("h2", {
					className: "font-display font-bold",
					children: [cart.length, " items"]
				}),
				cart.map((l) => {
					return /* @__PURE__ */ jsxs("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "truncate pr-2 text-muted-foreground",
							children: [
								l.qty,
								"× ",
								lang === "bn" && l.productNameBn ? l.productNameBn : l.productName
							]
						}), /* @__PURE__ */ jsx("span", { children: money(l.price * l.qty, lang) })]
					}, l.productId);
				}),
				/* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-2 border-t border-border pt-3 text-sm",
					children: [
						/* @__PURE__ */ jsx("input", {
							type: "checkbox",
							checked: useCoins,
							onChange: (e) => setUseCoins(e.target.checked),
							className: "accent-primary"
						}),
						"Redeem 500 ",
						t("coins"),
						" (−",
						money(500, lang),
						")"
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "space-y-1 border-t border-border pt-3 text-sm text-muted-foreground",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", { children: "Subtotal" }), /* @__PURE__ */ jsx("span", { children: money(subtotal, lang) })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", { children: "Delivery" }), /* @__PURE__ */ jsx("span", { children: money(delivery, lang) })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ jsx("span", { children: "Coins" }), /* @__PURE__ */ jsxs("span", { children: ["−", money(coinDiscount, lang)] })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between pt-2 font-display text-base font-bold text-foreground",
							children: [/* @__PURE__ */ jsx("span", { children: t("total") }), /* @__PURE__ */ jsx("span", { children: money(total, lang) })]
						})
					]
				}),
				/* @__PURE__ */ jsx("button", {
					onClick: () => void submit(),
					disabled: !cart.length || busy,
					className: "w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50",
					children: busy ? "Placing order..." : t("placeOrder")
				}),
				error && /* @__PURE__ */ jsx("p", {
					className: "text-xs text-destructive",
					children: error
				})
			]
		})]
	})] });
}
function Field$1({ label, value, span }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block text-xs font-medium text-muted-foreground " + (span ? "sm:col-span-2" : ""),
		children: [label, /* @__PURE__ */ jsx("input", {
			defaultValue: value,
			className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
		})]
	});
}
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region src/components/ui/button.tsx
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
//#region src/components/FirebaseSignInButton.tsx
var LABELS = {
	signin_with: "Sign in with Google",
	signup_with: "Sign up with Google",
	continue_with: "Continue with Google"
};
/** Signs in via Firebase Auth's Google popup, then exchanges the ID token for an API session. */
function FirebaseSignInButton({ role = "buyer", shopName, area, onSuccess, text = "signin_with" }) {
	const { loginWithFirebase } = useAuth();
	const [config, setConfig] = useState(hasEnvConfig() ? envConfig() : null);
	const [unavailable, setUnavailable] = useState(false);
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		if (config) return;
		let cancelled = false;
		api.auth.firebaseConfig().then((res) => {
			if (cancelled) return;
			if (res.apiKey && res.authDomain && res.projectId && res.appId) setConfig(res);
			else setUnavailable(true);
		}).catch(() => !cancelled && setUnavailable(true));
		return () => {
			cancelled = true;
		};
	}, [config]);
	async function handleClick() {
		if (!config) return;
		setError(null);
		setBusy(true);
		try {
			const idToken = await signInWithGooglePopup(config);
			await loginWithFirebase({
				idToken,
				role,
				shopName,
				area
			});
			onSuccess?.();
		} catch (err) {
			setError(toFirebaseAuthErrorMessage(err));
		} finally {
			setBusy(false);
		}
	}
	if (unavailable) return /* @__PURE__ */ jsxs("p", {
		className: "text-center text-[11px] text-muted-foreground",
		children: [
			"Google sign-in is not configured. Set",
			" ",
			/* @__PURE__ */ jsx("code", {
				className: "font-mono",
				children: "FIREBASE_*"
			}),
			" env vars on the API server."
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-2",
		children: [/* @__PURE__ */ jsxs(Button, {
			type: "button",
			variant: "outline",
			size: "lg",
			disabled: !config || busy,
			onClick: handleClick,
			className: "w-full",
			children: [busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxs("svg", {
				viewBox: "0 0 48 48",
				className: "size-4",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ jsx("path", {
						fill: "#FFC107",
						d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
					}),
					/* @__PURE__ */ jsx("path", {
						fill: "#FF3D00",
						d: "M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
					}),
					/* @__PURE__ */ jsx("path", {
						fill: "#4CAF50",
						d: "M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.5C29.4 34.9 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.6 39.7 16.2 44 24 44z"
					}),
					/* @__PURE__ */ jsx("path", {
						fill: "#1976D2",
						d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.5 5.5C39.7 37 44 31.4 44 24c0-1.3-.1-2.7-.4-3.5z"
					})
				]
			}), busy ? "Signing in…" : LABELS[text]]
		}), error && /* @__PURE__ */ jsx("p", {
			role: "alert",
			className: "text-center text-xs text-destructive",
			children: error
		})]
	});
}
//#endregion
//#region src/routes/login.tsx
var Route$8 = createFileRoute("/login")({
	validateSearch: (search) => ({ redirect: typeof search["redirect"] === "string" ? search["redirect"] : void 0 }),
	head: () => ({ meta: [
		{ title: "Sign in to your account — HyperLocal" },
		{
			name: "description",
			content: "Sign in to track orders, sync your cart and wishlist, and redeem reward coins."
		},
		{
			property: "og:title",
			content: "Sign in — HyperLocal"
		},
		{
			property: "og:description",
			content: "Access your HyperLocal buyer or seller account."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: LoginPage
});
var DEMOS = [{
	label: "Demo buyer",
	email: "buyer@hyperlocal.test"
}, {
	label: "Demo seller",
	email: "seller@hyperlocal.test"
}];
function LoginPage() {
	const { login, offline, user, loading } = useAuth();
	const navigate = useNavigate();
	const { redirect } = Route$8.useSearch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	useEffect(() => {
		const saved = window.localStorage.getItem("hl:lastEmail");
		if (saved) setEmail(saved);
	}, []);
	useEffect(() => {
		if (!loading && user) navigate({
			to: redirect ?? "/",
			replace: true
		});
	}, [
		loading,
		user,
		redirect,
		navigate
	]);
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const trimmed = email.trim().toLowerCase();
			await login(trimmed, password);
			window.localStorage.setItem("hl:lastEmail", trimmed);
			navigate({
				to: redirect ?? "/",
				replace: true
			});
		} catch (err) {
			setError(err instanceof Error ? err.message === "Failed to fetch" ? "Cannot reach the API server. Start it with: cd server && npm run dev" : err.message : "Sign in failed");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-md",
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: "font-display text-2xl font-bold",
				children: "Sign in"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: user ? `Signed in as ${user.name}.` : "Use your HyperLocal buyer or seller account."
			}),
			offline && /* @__PURE__ */ jsxs("div", {
				className: "card-surface mt-4 flex gap-3 p-4 text-sm",
				children: [/* @__PURE__ */ jsx(ServerCrash, { className: "size-5 shrink-0 text-destructive" }), /* @__PURE__ */ jsxs("p", {
					className: "text-muted-foreground",
					children: [
						"The Express API is not reachable. Start it with",
						" ",
						/* @__PURE__ */ jsx("code", {
							className: "font-mono",
							children: "cd server && npm run dev"
						}),
						" ",
						"and set ",
						/* @__PURE__ */ jsx("code", {
							className: "font-mono",
							children: "VITE_API_URL"
						}),
						"."
					]
				})]
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit,
				className: "card-surface mt-4 space-y-4 p-6",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Email"
						}), /* @__PURE__ */ jsx("input", {
							type: "email",
							required: true,
							autoComplete: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Password"
						}), /* @__PURE__ */ jsxs("div", {
							className: "relative mt-1",
							children: [/* @__PURE__ */ jsx("input", {
								type: showPassword ? "text" : "password",
								required: true,
								minLength: 8,
								autoComplete: "current-password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								className: "w-full rounded-lg border border-input bg-background px-3 py-2 pr-10"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => setShowPassword((v) => !v),
								"aria-label": showPassword ? "Hide password" : "Show password",
								className: "absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground",
								children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" })
							})]
						})]
					}),
					error && /* @__PURE__ */ jsx("p", {
						role: "alert",
						className: "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50",
						children: [
							/* @__PURE__ */ jsx(LogIn, { className: "size-4" }),
							" ",
							busy ? "Signing in…" : "Sign in"
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground",
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" }),
							" or",
							" ",
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ jsx(FirebaseSignInButton, {
						text: "signin_with",
						onSuccess: () => navigate({
							to: redirect ?? "/",
							replace: true
						})
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground",
						children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-3.5" }), " Sessions use short-lived tokens with an httpOnly refresh cookie."]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-center text-xs text-muted-foreground",
						children: [
							"No account?",
							" ",
							/* @__PURE__ */ jsx(Link, {
								to: "/register",
								className: "font-semibold text-primary",
								children: "Create one"
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex flex-wrap justify-center gap-2 border-t border-border pt-3",
						children: DEMOS.map((d) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => {
								setEmail(d.email);
								setPassword("Password123");
							},
							className: "rounded-full border border-border px-3 py-1 text-[11px] font-semibold",
							children: d.label
						}, d.email))
					})
				]
			})
		]
	}) });
}
//#endregion
//#region src/routes/orders.tsx
var icons = [
	ClipboardCheck,
	Package,
	Truck,
	Home
];
var Route$7 = createFileRoute("/orders")({
	head: () => ({ meta: [
		{ title: "Order tracking — HyperLocal" },
		{
			name: "description",
			content: "Track every order in real time from confirmation to delivery, with seller and payment details."
		},
		{
			property: "og:title",
			content: "Order tracking — HyperLocal"
		},
		{
			property: "og:description",
			content: "Live delivery status for all your multi-vendor orders."
		}
	] }),
	component: OrdersPage
});
function OrdersPage() {
	const { lang, t } = useLang();
	const { orders } = useStore();
	const [open, setOpen] = useState(orders[0]?.id ?? null);
	return /* @__PURE__ */ jsxs(Layout, { children: [/* @__PURE__ */ jsx("h1", {
		className: "font-display text-2xl font-bold",
		children: t("orders")
	}), /* @__PURE__ */ jsx("div", {
		className: "mt-4 space-y-3",
		children: orders.map((o) => {
			const expanded = open === o.id;
			return /* @__PURE__ */ jsxs("div", {
				className: "card-surface overflow-hidden",
				children: [/* @__PURE__ */ jsxs("button", {
					onClick: () => setOpen(expanded ? null : o.id),
					className: "flex w-full items-center gap-3 p-4 text-left",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "flex size-11 items-center justify-center rounded-xl bg-secondary text-xl",
							children: "📦"
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ jsxs("p", {
								className: "text-sm font-semibold",
								children: ["#", o.id]
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-[11px] text-muted-foreground",
								children: [
									o.date,
									" · ",
									o.payment
								]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "text-right",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-display font-bold",
								children: money(o.total, lang)
							}), /* @__PURE__ */ jsx("p", {
								className: "text-[11px] text-primary",
								children: o.status.replace(/_/g, " ")
							})]
						})
					]
				}), expanded && /* @__PURE__ */ jsxs("div", {
					className: "border-t border-border p-4",
					children: [
						/* @__PURE__ */ jsx("div", {
							className: "flex items-center",
							children: o.tracking.map((step, i) => {
								const done = step.done;
								const Icon = icons[i];
								return /* @__PURE__ */ jsxs("div", {
									className: "flex flex-1 items-center last:flex-none",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex flex-col items-center gap-1",
										children: [/* @__PURE__ */ jsx("span", {
											className: "flex size-9 items-center justify-center rounded-full border-2 " + (done ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"),
											children: done ? /* @__PURE__ */ jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsx(Icon, { className: "size-4" })
										}), /* @__PURE__ */ jsx("span", {
											className: "w-20 text-center text-[10px] " + (done ? "font-semibold" : "text-muted-foreground"),
											children: lang === "bn" && step.labelBn ? step.labelBn : step.label
										})]
									}), i < o.tracking.length - 1 && /* @__PURE__ */ jsx("div", { className: "mb-5 h-0.5 flex-1 " + (done ? "bg-primary" : "bg-border") })]
								}, step.label + i);
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 rounded-xl bg-secondary p-3 text-xs",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-semibold",
								children: "Live update"
							}), /* @__PURE__ */ jsx("p", {
								className: "text-muted-foreground",
								children: o.status >= 3 ? "Delivered and signed for. Rate the seller to earn 20 coins." : "Rider Shakil is 2.4 km away · estimated arrival 5:40 PM · +880 1911 223344"
							})]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-3 space-y-2",
							children: o.items.map((it) => {
								return /* @__PURE__ */ jsxs("div", {
									className: "flex items-center gap-3 rounded-lg border border-border p-2",
									children: [
										/* @__PURE__ */ jsx("span", {
											className: "flex size-10 items-center justify-center rounded-md text-lg",
											children: it.emoji ?? "📦"
										}),
										/* @__PURE__ */ jsx("span", {
											className: "flex-1 text-sm",
											children: it.name
										}),
										/* @__PURE__ */ jsxs("span", {
											className: "text-xs text-muted-foreground",
											children: ["×", it.qty]
										})
									]
								}, it.productId);
							})
						})
					]
				})]
			}, o.id);
		})
	})] });
}
//#endregion
//#region src/routes/profile.tsx
var Route$6 = createFileRoute("/profile")({
	head: () => ({ meta: [
		{ title: "Your profile — HyperLocal" },
		{
			name: "description",
			content: "Manage your account details, addresses, payment methods, notifications and language preference."
		},
		{
			property: "og:title",
			content: "Your profile — HyperLocal"
		},
		{
			property: "og:description",
			content: "Account, addresses, payments and notification settings."
		}
	] }),
	component: ProfilePage
});
var PREF_KEYS = [
	["order", "Order updates"],
	["price", "Price drops on wishlist"],
	["promo", "Promotions & flash sales"],
	["reward", "Coins & coupon expiry"]
];
function ProfilePage() {
	const { lang, setLang, t } = useLang();
	const { orders, wishlist, coins, notifications, viewed } = useStore();
	const { user, sellerProfile, isSeller, loading, offline, setUser } = useAuth();
	const live = !!user;
	const [form, setForm] = useState({
		name: "",
		phone: "",
		email: "",
		area: ""
	});
	const [prefs, setPrefs] = useState({
		order: true,
		price: true,
		promo: false,
		reward: true
	});
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState(null);
	useEffect(() => {
		if (!user) return;
		const def = (user.addresses ?? []).find((a) => a.isDefault) ?? user.addresses?.[0];
		setForm({
			name: user.name ?? "",
			phone: user.phone ?? "",
			email: user.email ?? "",
			area: [def?.area, def?.city].filter(Boolean).join(", ")
		});
		setPrefs({
			order: true,
			price: true,
			promo: false,
			reward: true,
			...user.notificationPrefs ?? {}
		});
	}, [user]);
	const save = async () => {
		if (!user) return;
		setSaving(true);
		setError(null);
		try {
			const res = await api.users.updateProfile({
				name: form.name,
				phone: form.phone,
				language: lang,
				notificationPrefs: prefs
			});
			setUser(res.user);
			setSaved(true);
			setTimeout(() => setSaved(false), 2500);
		} catch (e) {
			setError(e instanceof Error ? e.message : "Could not save your profile");
		} finally {
			setSaving(false);
		}
	};
	if (loading) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2 p-10 text-muted-foreground",
		children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), " Loading your profile…"]
	}) });
	const displayName = user?.name ?? "Ayesha Rahman";
	const initials = displayName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
	const statCoins = user?.coins ?? coins;
	const statWishlist = user ? user.wishlist.length : wishlist.length;
	return /* @__PURE__ */ jsxs(Layout, { children: [
		!live && /* @__PURE__ */ jsxs("div", {
			className: "card-surface mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-accent p-4",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-sm text-muted-foreground",
				children: offline ? "The API isn’t reachable. Start the Express server to load your account." : "You’re browsing as a guest. Sign in to see your real profile, orders and rewards."
			}), /* @__PURE__ */ jsx(Link, {
				to: "/login",
				search: { redirect: "/profile" },
				className: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
				children: "Sign in"
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface flex flex-wrap items-center gap-4 p-6",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "flex size-16 items-center justify-center rounded-2xl bg-hero-gradient text-2xl font-bold text-primary-foreground",
					children: user?.avatarEmoji || initials
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "flex items-center gap-2 font-display text-2xl font-bold",
							children: [displayName, live && /* @__PURE__ */ jsx(ShieldCheck, { className: "size-5 text-success" })]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm text-muted-foreground",
							children: [user?.email ?? "ayesha.r@example.com", (user?.phone || !live) && ` · ${user?.phone ?? "+880 1712 345678"}`]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsx(MapPin, { className: "size-3.5" }),
								" ",
								form.area || "Dhanmondi 27, Dhaka",
								" ·",
								" ",
								live ? `${user?.role} account` : "Silver member since 2023"
							]
						})
					]
				}),
				(isSeller || !live) && /* @__PURE__ */ jsxs(Link, {
					to: "/seller",
					className: "flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary",
					children: [
						/* @__PURE__ */ jsx(Store, { className: "size-4" }),
						" ",
						isSeller ? "Seller dashboard" : "Switch to seller view"
					]
				})
			]
		}),
		live && sellerProfile && /* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-4 flex flex-wrap items-center gap-3 p-4",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "flex size-11 items-center justify-center rounded-xl bg-accent-gradient text-xl text-accent-foreground",
					children: "🏪"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-display font-bold",
						children: lang === "bn" && sellerProfile.nameBn ? sellerProfile.nameBn : sellerProfile.name
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-muted-foreground",
						children: [
							sellerProfile.area,
							" · rating ",
							sellerProfile.rating ?? "—",
							" · ",
							sellerProfile.verified ? "verified shop" : "verification pending"
						]
					})]
				}),
				/* @__PURE__ */ jsx(Link, {
					to: "/seller",
					className: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
					children: "Manage shop"
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-4",
			children: [
				{
					icon: Package,
					label: t("orders"),
					value: orders.length,
					to: "/orders"
				},
				{
					icon: Heart,
					label: t("wishlist"),
					value: statWishlist,
					to: "/wishlist"
				},
				{
					icon: Coins,
					label: t("coins"),
					value: statCoins,
					to: "/rewards"
				},
				{
					icon: Bell,
					label: t("notifications"),
					value: notifications.length,
					to: "/profile"
				}
			].map((s) => /* @__PURE__ */ jsxs(Link, {
				to: s.to,
				className: "card-surface flex items-center gap-3 p-4 hover:bg-secondary/50",
				children: [/* @__PURE__ */ jsx(s.icon, { className: "size-5 text-primary" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
					className: "font-display text-lg font-bold",
					children: s.value
				}), /* @__PURE__ */ jsx("div", {
					className: "text-[11px] text-muted-foreground",
					children: s.label
				})] })]
			}, s.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-2",
			children: [
				/* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "flex items-center gap-2 font-display font-bold",
							children: [/* @__PURE__ */ jsx(Settings, { className: "size-4" }), " Account details"]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "Full name",
									value: form.name,
									onChange: (v) => setForm((f) => ({
										...f,
										name: v
									}))
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Phone",
									value: form.phone,
									onChange: (v) => setForm((f) => ({
										...f,
										phone: v
									}))
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Email",
									value: form.email,
									readOnly: true
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "Default area",
									value: form.area,
									onChange: (v) => setForm((f) => ({
										...f,
										area: v
									})),
									readOnly: !live
								})
							]
						}),
						error && /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm text-destructive",
							children: error
						}),
						/* @__PURE__ */ jsxs("button", {
							onClick: save,
							disabled: !live || saving,
							className: "mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50",
							children: [saving ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : saved ? /* @__PURE__ */ jsx(Check, { className: "size-4" }) : null, saved ? "Saved" : "Save changes"]
						}),
						!live && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Sign in to edit your account."
						})
					]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "flex items-center gap-2 font-display font-bold",
							children: [/* @__PURE__ */ jsx(CreditCard, { className: "size-4" }), " Saved payments"]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-3 space-y-2 text-sm",
							children: [
								[
									"bKash",
									"•••• 5678",
									"Default"
								],
								[
									"Visa",
									"•••• 4242",
									""
								],
								[
									"HyperLocal wallet",
									money(statCoins, lang),
									""
								]
							].map(([a, b, c]) => /* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between rounded-lg border border-border px-3 py-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-medium",
										children: a
									}),
									/* @__PURE__ */ jsx("span", {
										className: "text-muted-foreground",
										children: b
									}),
									c && /* @__PURE__ */ jsx("span", {
										className: "rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold",
										children: c
									})
								]
							}, a))
						}),
						live && (user?.addresses?.length ?? 0) > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", {
							className: "mt-5 font-display font-bold",
							children: "Delivery addresses"
						}), /* @__PURE__ */ jsx("div", {
							className: "mt-2 space-y-2 text-sm",
							children: user.addresses.map((a, i) => /* @__PURE__ */ jsxs("div", {
								className: "rounded-lg border border-border px-3 py-2",
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "font-medium",
										children: a.label ?? "Address"
									}),
									" ",
									/* @__PURE__ */ jsx("span", {
										className: "text-muted-foreground",
										children: [
											a.line1,
											a.area,
											a.city
										].filter(Boolean).join(", ")
									}),
									a.isDefault && /* @__PURE__ */ jsx("span", {
										className: "ml-2 rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold",
										children: "Default"
									})
								]
							}, a._id ?? i))
						})] })
					]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "flex items-center gap-2 font-display font-bold",
							children: [/* @__PURE__ */ jsx(Bell, { className: "size-4" }), " Notification preferences"]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-3 space-y-2",
							children: PREF_KEYS.map(([key, label]) => /* @__PURE__ */ jsxs("label", {
								className: "flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm",
								children: [label, /* @__PURE__ */ jsx("input", {
									type: "checkbox",
									checked: !!prefs[key],
									onChange: (e) => setPrefs((p) => ({
										...p,
										[key]: e.target.checked
									})),
									className: "accent-primary"
								})]
							}, key))
						}),
						live && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Preferences are stored with “Save changes”."
						})
					]
				}),
				/* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsxs("h2", {
							className: "flex items-center gap-2 font-display font-bold",
							children: [/* @__PURE__ */ jsx(Globe, { className: "size-4" }), " Language"]
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-3 flex gap-2",
							children: ["en", "bn"].map((l) => /* @__PURE__ */ jsx("button", {
								onClick: () => setLang(l),
								className: "flex-1 rounded-xl border px-4 py-3 text-sm font-semibold " + (lang === l ? "border-primary bg-primary text-primary-foreground" : "border-border"),
								children: l === "en" ? "English" : "বাংলা"
							}, l))
						}),
						/* @__PURE__ */ jsx("h3", {
							className: "mt-5 font-display font-bold",
							children: "Recently viewed"
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-2 flex flex-wrap gap-2",
							children: viewed.map((slug) => /* @__PURE__ */ jsxs(Link, {
								to: "/product/$productId",
								params: { productId: slug },
								className: "flex items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs hover:bg-secondary",
								children: [
									/* @__PURE__ */ jsx("span", { children: "📦" }),
									" ",
									slug.slice(0, 28)
								]
							}, slug))
						})
					]
				})
			]
		})
	] });
}
function Field({ label, value, onChange, readOnly }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block text-xs font-medium text-muted-foreground",
		children: [label, /* @__PURE__ */ jsx("input", {
			value,
			readOnly: readOnly || !onChange,
			onChange: (e) => onChange?.(e.target.value),
			className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring read-only:opacity-70"
		})]
	});
}
//#endregion
//#region src/routes/register.tsx
var Route$5 = createFileRoute("/register")({
	head: () => ({ meta: [
		{ title: "Create a buyer or seller account — HyperLocal" },
		{
			name: "description",
			content: "Open a HyperLocal account to shop from local vendors, or register your shop as a seller."
		},
		{
			property: "og:title",
			content: "Create your account — HyperLocal"
		},
		{
			property: "og:description",
			content: "Buyer and seller registration for the HyperLocal marketplace."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: RegisterPage
});
function RegisterPage() {
	const { register } = useAuth();
	const navigate = useNavigate();
	const [role, setRole] = useState("buyer");
	const [form, setForm] = useState({
		name: "",
		email: "",
		password: "",
		phone: "",
		shopName: "",
		area: ""
	});
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);
	const set = (k) => (e) => setForm((f) => ({
		...f,
		[k]: e.target.value
	}));
	async function onSubmit(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			await register({
				name: form.name.trim(),
				email: form.email.trim(),
				password: form.password,
				phone: form.phone.trim() || void 0,
				role,
				shopName: role === "seller" ? form.shopName.trim() : void 0,
				area: role === "seller" ? form.area.trim() : void 0
			});
			navigate({ to: role === "seller" ? "/seller" : "/" });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration failed");
		} finally {
			setBusy(false);
		}
	}
	const field = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2";
	return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "mx-auto max-w-md",
		children: [
			/* @__PURE__ */ jsx("h1", {
				className: "font-display text-2xl font-bold",
				children: "Create your account"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Buyers shop locally; sellers get a storefront and dashboard."
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mt-4 grid grid-cols-2 gap-2",
				children: [[
					"buyer",
					"I'm shopping",
					ShoppingBag
				], [
					"seller",
					"I sell products",
					Store
				]].map(([value, label, Icon]) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setRole(value),
					className: "flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold " + (role === value ? "border-primary bg-primary text-primary-foreground" : "border-border"),
					children: [
						/* @__PURE__ */ jsx(Icon, { className: "size-4" }),
						" ",
						label
					]
				}, value))
			}),
			/* @__PURE__ */ jsxs("form", {
				onSubmit,
				className: "card-surface mt-4 space-y-4 p-6",
				children: [
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Full name"
						}), /* @__PURE__ */ jsx("input", {
							required: true,
							minLength: 2,
							maxLength: 80,
							value: form.name,
							onChange: set("name"),
							className: field
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Email"
						}), /* @__PURE__ */ jsx("input", {
							type: "email",
							required: true,
							maxLength: 255,
							value: form.email,
							onChange: set("email"),
							className: field
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Phone (optional)"
						}), /* @__PURE__ */ jsx("input", {
							maxLength: 20,
							value: form.phone,
							onChange: set("phone"),
							className: field
						})]
					}),
					/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [
							/* @__PURE__ */ jsx("span", {
								className: "font-medium",
								children: "Password"
							}),
							/* @__PURE__ */ jsx("input", {
								type: "password",
								required: true,
								minLength: 8,
								maxLength: 128,
								value: form.password,
								onChange: set("password"),
								className: field
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-xs text-muted-foreground",
								children: "At least 8 characters."
							})
						]
					}),
					role === "seller" && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Shop name"
						}), /* @__PURE__ */ jsx("input", {
							required: true,
							minLength: 2,
							maxLength: 80,
							value: form.shopName,
							onChange: set("shopName"),
							className: field
						})]
					}), /* @__PURE__ */ jsxs("label", {
						className: "block text-sm",
						children: [/* @__PURE__ */ jsx("span", {
							className: "font-medium",
							children: "Area"
						}), /* @__PURE__ */ jsx("input", {
							maxLength: 120,
							placeholder: "Dhanmondi, Dhaka",
							value: form.area,
							onChange: set("area"),
							className: field
						})]
					})] }),
					error && /* @__PURE__ */ jsx("p", {
						className: "text-sm text-destructive",
						children: error
					}),
					/* @__PURE__ */ jsxs("button", {
						type: "submit",
						disabled: busy,
						className: "flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50",
						children: [
							/* @__PURE__ */ jsx(UserPlus, { className: "size-4" }),
							" ",
							busy ? "Creating…" : "Create account"
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground",
						children: [
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" }),
							" or",
							" ",
							/* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-border" })
						]
					}),
					/* @__PURE__ */ jsx(FirebaseSignInButton, {
						text: "signup_with",
						role,
						shopName: role === "seller" ? form.shopName.trim() || void 0 : void 0,
						area: role === "seller" ? form.area.trim() || void 0 : void 0,
						onSuccess: () => navigate({ to: role === "seller" ? "/seller" : "/" })
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-center text-xs text-muted-foreground",
						children: [
							"Already registered?",
							" ",
							/* @__PURE__ */ jsx(Link, {
								to: "/login",
								search: { redirect: void 0 },
								className: "font-semibold text-primary",
								children: "Sign in"
							})
						]
					})
				]
			})
		]
	}) });
}
//#endregion
//#region src/routes/rewards.tsx
var Route$4 = createFileRoute("/rewards")({
	head: () => ({ meta: [
		{ title: "Rewards & coupons — HyperLocal" },
		{
			name: "description",
			content: "Earn coins on every order and redeem them for discounts, vouchers and free delivery."
		},
		{
			property: "og:title",
			content: "Rewards & coupons — HyperLocal"
		},
		{
			property: "og:description",
			content: "Loyalty coins, redeemable vouchers and tier progress."
		}
	] }),
	component: RewardsPage
});
function RewardsPage() {
	const { t } = useLang();
	const { coins, reload } = useStore();
	const [claimed, setClaimed] = useState([]);
	const coupons = useAsync(() => api.rewards.coupons(), [], true);
	const me = useAsync(() => api.rewards.me(), [], true);
	const redeem = async (code) => {
		await api.rewards.redeem(code);
		setClaimed((c) => [...c, code]);
		await Promise.all([reload(), me.reload()]);
	};
	const liveCoins = me.data?.coins ?? coins;
	const nextTier = liveCoins + (me.data?.coinsToNextTier ?? 2e3);
	return /* @__PURE__ */ jsxs(Layout, { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "font-display text-2xl font-bold",
			children: t("rewards")
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-4 grid gap-4 md:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "card-surface bg-hero-gradient p-6 text-primary-foreground md:col-span-2",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-2 text-sm opacity-90",
						children: [/* @__PURE__ */ jsx(Coins, { className: "size-4" }), " Coin balance"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "font-display text-4xl font-extrabold",
						children: liveCoins
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs opacity-80",
						children: "100 coins = ৳100 off · earn 1 coin per ৳50 spent"
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-4",
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-2 overflow-hidden rounded-full bg-primary-foreground/25",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full rounded-full bg-accent-gradient",
								style: { width: `${Math.min(100, liveCoins / nextTier * 100)}%` }
							})
						}), /* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-xs opacity-80",
							children: [me.data?.coinsToNextTier ?? Math.max(0, nextTier - liveCoins), " coins to Gold tier (free delivery on all local orders)"]
						})]
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "card-surface space-y-3 p-5",
				children: [/* @__PURE__ */ jsxs("h2", {
					className: "flex items-center gap-2 font-display font-bold",
					children: [/* @__PURE__ */ jsx(TrendingUp, { className: "size-4 text-primary" }), " How you earned"]
				}), [
					["Order #HL-2291", "+129"],
					["Order #HL-2264", "+70"],
					["Review with photo", "+25"],
					["Referred a friend", "+200"]
				].map(([label, amt]) => /* @__PURE__ */ jsxs("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-muted-foreground",
						children: label
					}), /* @__PURE__ */ jsx("span", {
						className: "font-semibold text-success",
						children: amt
					})]
				}, label))]
			})]
		}),
		/* @__PURE__ */ jsxs("h2", {
			className: "mt-8 flex items-center gap-2 font-display text-xl font-bold",
			children: [/* @__PURE__ */ jsx(Ticket, { className: "size-5 text-accent" }), " Redeem coupons"]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-3 grid gap-4 sm:grid-cols-3",
			children: (coupons.data?.items ?? []).map((c) => {
				const done = claimed.includes(c.code) || (me.data?.claimedCoupons ?? []).includes(c.code);
				return /* @__PURE__ */ jsxs("div", {
					className: "card-surface flex flex-col gap-2 p-5",
					children: [
						/* @__PURE__ */ jsx("span", {
							className: "w-fit rounded-lg bg-accent-gradient px-2 py-0.5 font-mono text-xs font-bold text-accent-foreground",
							children: c.code
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm font-medium",
							children: c.label
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-muted-foreground",
							children: ["Expires ", c.expires]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => void redeem(c.code),
							disabled: done || liveCoins < c.cost,
							className: "mt-auto rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground disabled:opacity-40",
							children: done ? "✓ Claimed" : `${t("redeem")} · ${c.cost} ${t("coins")}`
						})
					]
				}, c.code);
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-8 flex items-center gap-4 p-5",
			children: [/* @__PURE__ */ jsx(Gift, { className: "size-8 text-accent" }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "font-display font-bold",
				children: "Refer a neighbour, earn 200 coins"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-xs text-muted-foreground",
				children: "They get ৳150 off their first local order. Code: AYESHA200"
			})] })]
		})
	] });
}
//#endregion
//#region src/routes/search.tsx
var Route$3 = createFileRoute("/search")({
	validateSearch: (s) => ({
		q: typeof s["q"] === "string" ? s["q"] : "",
		category: typeof s["category"] === "string" ? s["category"] : void 0
	}),
	head: () => ({ meta: [
		{ title: "Search products & categories — HyperLocal" },
		{
			name: "description",
			content: "Search by name, brand or category with filters for price, rating, local sellers and delivery speed."
		},
		{
			property: "og:title",
			content: "Search products — HyperLocal"
		},
		{
			property: "og:description",
			content: "Filter and sort listings from local shops and online retailers."
		}
	] }),
	component: SearchPage
});
function SearchPage() {
	const { q, category } = Route$3.useSearch();
	const { lang, t } = useLang();
	const [cat, setCat] = useState(category);
	const [maxPrice, setMaxPrice] = useState(1e4);
	const [minRating, setMinRating] = useState(0);
	const [localOnly, setLocalOnly] = useState(false);
	const [sort, setSort] = useState("relevance");
	const productsRes = useAsync(() => api.products.list({
		q,
		category: cat,
		maxPrice,
		minRating,
		localOnly: localOnly ? "true" : "false",
		sort,
		page: 1,
		limit: 48
	}), [
		q,
		cat,
		maxPrice,
		minRating,
		localOnly,
		sort
	], true);
	const categoriesRes = useAsync(() => api.products.categories(), [], true);
	const list = productsRes.data?.items ?? [];
	return /* @__PURE__ */ jsxs(Layout, { children: [/* @__PURE__ */ jsxs("h1", {
		className: "font-display text-2xl font-bold",
		children: [
			q ? `“${q}”` : lang === "bn" ? "সব পণ্য" : "All products",
			" ",
			/* @__PURE__ */ jsxs("span", {
				className: "text-base font-normal text-muted-foreground",
				children: [
					"· ",
					list.length,
					" ",
					t("results")
				]
			})
		]
	}), /* @__PURE__ */ jsxs("div", {
		className: "mt-4 grid gap-6 lg:grid-cols-[240px_1fr]",
		children: [/* @__PURE__ */ jsxs("aside", {
			className: "card-surface h-fit space-y-5 p-4",
			children: [
				/* @__PURE__ */ jsxs("h2", {
					className: "flex items-center gap-2 font-display font-bold",
					children: [
						/* @__PURE__ */ jsx(SlidersHorizontal, { className: "size-4" }),
						" ",
						t("filters")
					]
				}),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "mb-2 text-xs font-semibold uppercase text-muted-foreground",
					children: t("categories")
				}), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap gap-1.5",
					children: [/* @__PURE__ */ jsx("button", {
						onClick: () => setCat(void 0),
						className: "rounded-full border px-2.5 py-1 text-xs " + (!cat ? "border-primary bg-primary text-primary-foreground" : "border-border"),
						children: "All"
					}), (categoriesRes.data?.items ?? []).map((c) => /* @__PURE__ */ jsx("button", {
						onClick: () => setCat(c === cat ? void 0 : c),
						className: "rounded-full border px-2.5 py-1 text-xs " + (cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border"),
						children: c
					}, c))]
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("p", {
					className: "mb-1 text-xs font-semibold uppercase text-muted-foreground",
					children: ["Max price · ", money(maxPrice, lang)]
				}), /* @__PURE__ */ jsx("input", {
					type: "range",
					min: 500,
					max: 1e4,
					step: 100,
					value: maxPrice,
					onChange: (e) => setMaxPrice(Number(e.target.value)),
					className: "w-full accent-primary"
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "mb-2 text-xs font-semibold uppercase text-muted-foreground",
					children: "Minimum rating"
				}), /* @__PURE__ */ jsx("div", {
					className: "flex gap-1.5",
					children: [
						0,
						4,
						4.5
					].map((r) => /* @__PURE__ */ jsx("button", {
						onClick: () => setMinRating(r),
						className: "rounded-lg border px-2.5 py-1 text-xs " + (minRating === r ? "border-primary bg-primary text-primary-foreground" : "border-border"),
						children: r === 0 ? "Any" : `${r}★+`
					}, r))
				})] }),
				/* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						checked: localOnly,
						onChange: (e) => setLocalOnly(e.target.checked),
						className: "accent-primary"
					}), lang === "bn" ? "শুধু স্থানীয় বিক্রেতা" : "Local sellers only"]
				}),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "mb-1 text-xs font-semibold uppercase text-muted-foreground",
					children: t("sortBy")
				}), /* @__PURE__ */ jsxs("select", {
					value: sort,
					onChange: (e) => setSort(e.target.value),
					className: "w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm",
					children: [
						/* @__PURE__ */ jsx("option", {
							value: "relevance",
							children: "Relevance"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "price-asc",
							children: "Price: low to high"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "price-desc",
							children: "Price: high to low"
						}),
						/* @__PURE__ */ jsx("option", {
							value: "rating",
							children: "Top rated"
						})
					]
				})] })
			]
		}), /* @__PURE__ */ jsxs("div", { children: [
			productsRes.loading && /* @__PURE__ */ jsx("p", {
				className: "mb-3 text-sm text-muted-foreground",
				children: "Loading products..."
			}),
			productsRes.error && /* @__PURE__ */ jsx("p", {
				className: "mb-3 text-sm text-destructive",
				children: productsRes.error
			}),
			list.length === 0 ? /* @__PURE__ */ jsx("div", {
				className: "card-surface p-10 text-center text-sm text-muted-foreground",
				children: "No products matched. Try clearing filters or searching a category like “grocery”."
			}) : /* @__PURE__ */ jsx("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: list.map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p._id))
			})
		] })]
	})] });
}
//#endregion
//#region src/components/seller/ListingForm.tsx
var EMPTY = {
	name: "",
	nameBn: "",
	brand: "",
	category: "grocery",
	description: "",
	emoji: "📦",
	image: "",
	price: 0,
	stock: 1,
	delivery: "Same-day",
	tags: []
};
var CATEGORIES = [
	"grocery",
	"electronics",
	"fashion",
	"home",
	"beauty",
	"pharmacy",
	"handicraft"
];
var MAX_IMAGE_BYTES = 5242880;
/**
* Presentational create-listing form. It owns only draft state and delegates
* persistence to the caller (Dependency Inversion — no API import here for
* the listing itself; the image upload is a separate, self-contained concern).
*/
function ListingForm({ onSubmit }) {
	const [draft, setDraft] = useState(EMPTY);
	const [tagText, setTagText] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const [done, setDone] = useState(false);
	const [imagePreview, setImagePreview] = useState(null);
	const [uploading, setUploading] = useState(false);
	const [imageError, setImageError] = useState(null);
	const fileInputRef = useRef(null);
	const set = (key, value) => setDraft((d) => ({
		...d,
		[key]: value
	}));
	const pickImage = () => fileInputRef.current?.click();
	const onImageSelected = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		setImageError(null);
		if (!file.type.startsWith("image/")) {
			setImageError("Please choose an image file");
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			setImageError("Image is too large (max 5MB)");
			return;
		}
		const localPreview = URL.createObjectURL(file);
		setImagePreview(localPreview);
		setUploading(true);
		try {
			const { url } = await api.sellers.uploadImage(file);
			set("image", url);
		} catch (err) {
			setImageError(err instanceof Error ? err.message : "Upload failed");
			setImagePreview(null);
			set("image", "");
		} finally {
			setUploading(false);
		}
	};
	const removeImage = () => {
		setImagePreview(null);
		setImageError(null);
		set("image", "");
	};
	const submit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		setDone(false);
		try {
			await onSubmit({
				...draft,
				price: Number(draft.price),
				stock: Number(draft.stock),
				tags: tagText.split(",").map((t) => t.trim()).filter(Boolean)
			});
			setDraft(EMPTY);
			setTagText("");
			setImagePreview(null);
			setDone(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create the listing");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ jsxs("form", {
		onSubmit: submit,
		className: "mt-3 grid gap-3 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "sm:col-span-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "block text-xs font-medium text-muted-foreground",
						children: "Product photo"
					}),
					/* @__PURE__ */ jsx("input", {
						ref: fileInputRef,
						type: "file",
						accept: "image/png,image/jpeg,image/webp,image/gif",
						className: "hidden",
						onChange: onImageSelected
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-1 flex items-center gap-3",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-input bg-background",
							children: [imagePreview ? /* @__PURE__ */ jsx("img", {
								src: imagePreview,
								alt: "Preview",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ jsx("span", {
								className: "text-2xl",
								children: draft.emoji || "📦"
							}), uploading && /* @__PURE__ */ jsx("div", {
								className: "absolute inset-0 flex items-center justify-center bg-background/70",
								children: /* @__PURE__ */ jsx(Loader2, { className: "size-5 animate-spin" })
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col gap-1",
							children: [
								/* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: pickImage,
									disabled: uploading,
									className: "inline-flex items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50",
									children: [/* @__PURE__ */ jsx(ImagePlus, { className: "size-3.5" }), imagePreview ? "Change photo" : "Upload photo"]
								}),
								imagePreview && !uploading && /* @__PURE__ */ jsxs("button", {
									type: "button",
									onClick: removeImage,
									className: "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive",
									children: [/* @__PURE__ */ jsx(X, { className: "size-3.5" }), " Remove"]
								}),
								/* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-muted-foreground",
									children: "JPEG, PNG, WebP or GIF, up to 5MB."
								})
							]
						})]
					}),
					imageError && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-destructive",
						children: imageError
					})
				]
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Product name",
				value: draft.name,
				onChange: (v) => set("name", v),
				required: true
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Bangla name (optional)",
				value: draft.nameBn ?? "",
				onChange: (v) => set("nameBn", v)
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Brand",
				value: draft.brand ?? "",
				onChange: (v) => set("brand", v)
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "block text-xs font-medium text-muted-foreground",
				children: ["Category", /* @__PURE__ */ jsx("select", {
					value: draft.category,
					onChange: (e) => set("category", e.target.value),
					className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
					children: CATEGORIES.map((c) => /* @__PURE__ */ jsx("option", {
						value: c,
						children: c
					}, c))
				})]
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Price (৳)",
				type: "number",
				value: String(draft.price),
				onChange: (v) => set("price", Number(v)),
				required: true
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Stock",
				type: "number",
				value: String(draft.stock),
				onChange: (v) => set("stock", Number(v)),
				required: true
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Emoji",
				value: draft.emoji ?? "",
				onChange: (v) => set("emoji", v)
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Delivery promise",
				value: draft.delivery ?? "",
				onChange: (v) => set("delivery", v)
			}),
			/* @__PURE__ */ jsx(Input, {
				label: "Tags (comma separated)",
				value: tagText,
				onChange: setTagText,
				className: "sm:col-span-2"
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "block text-xs font-medium text-muted-foreground sm:col-span-2",
				children: ["Description", /* @__PURE__ */ jsx("textarea", {
					value: draft.description ?? "",
					onChange: (e) => set("description", e.target.value),
					rows: 3,
					className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
				})]
			}),
			error && /* @__PURE__ */ jsx("p", {
				className: "text-sm text-destructive sm:col-span-2",
				children: error
			}),
			done && /* @__PURE__ */ jsx("p", {
				className: "text-sm text-success sm:col-span-2",
				children: "Listing published to your shop."
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "submit",
				disabled: busy || uploading,
				className: "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:col-span-2",
				children: [busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(PackagePlus, { className: "size-4" }), "Publish listing"]
			})
		]
	});
}
function Input({ label, value, onChange, type = "text", required, className = "" }) {
	return /* @__PURE__ */ jsxs("label", {
		className: "block text-xs font-medium text-muted-foreground " + className,
		children: [label, /* @__PURE__ */ jsx("input", {
			type,
			value,
			required,
			onChange: (e) => onChange(e.target.value),
			className: "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
		})]
	});
}
//#endregion
//#region src/routes/seller.tsx
var Route$2 = createFileRoute("/seller")({
	head: () => ({ meta: [
		{ title: "Seller dashboard — HyperLocal" },
		{
			name: "description",
			content: "Storefront profile, listings, sales performance and AI decision support for local vendors."
		},
		{
			property: "og:title",
			content: "Seller dashboard — HyperLocal"
		},
		{
			property: "og:description",
			content: "AI insights that help local sellers price, stock and grow."
		}
	] }),
	component: SellerPage
});
function SellerPage() {
	const { lang } = useLang();
	const { user, sellerProfile, isSeller, loading: authLoading } = useAuth();
	const live = isSeller;
	const dash = useAsync(() => api.sellers.dashboard(), [user?.id], live);
	if (authLoading) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2 p-10 text-muted-foreground",
		children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), " Loading your shop…"]
	}) });
	if (!live) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "card-surface mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-l-accent p-4",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: "Sign in with a seller account to load your shop data from the backend."
		}), /* @__PURE__ */ jsx(Link, {
			to: "/login",
			search: { redirect: "/seller" },
			className: "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
			children: "Sign in as seller"
		})]
	}) });
	const data = dash.data;
	const shop = data?.seller ?? sellerProfile;
	const listings = data?.listings ?? [];
	const metrics = data?.metrics;
	const createListing = async (input) => {
		await api.sellers.createProduct(input);
		dash.reload();
	};
	return /* @__PURE__ */ jsxs(Layout, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "card-surface flex flex-wrap items-center gap-4 p-6",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "flex size-16 items-center justify-center rounded-2xl bg-accent-gradient text-2xl text-accent-foreground",
					children: "🏪"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex-1",
					children: [
						/* @__PURE__ */ jsxs("h1", {
							className: "flex items-center gap-2 font-display text-2xl font-bold",
							children: [shop ? lang === "bn" && shop.nameBn ? shop.nameBn : shop.name : user?.name, shop?.verified && /* @__PURE__ */ jsx(ShieldCheck, { className: "size-5 text-success" })]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: [
								shop?.area,
								shop?.since && `since ${shop.since}`,
								shop?.responseTime && `replies in ${shop.responseTime}`
							].filter(Boolean).join(" · ")
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 flex items-center gap-1 text-sm",
							children: [
								/* @__PURE__ */ jsx(Star, { className: "size-4 fill-accent text-accent" }),
								" ",
								shop?.rating ?? "—",
								" · ",
								listings.length,
								" active listings"
							]
						})
					]
				}),
				/* @__PURE__ */ jsxs(Link, {
					to: "/profile",
					className: "flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary",
					children: [/* @__PURE__ */ jsx(Store, { className: "size-4" }), " Account"]
				})
			]
		}),
		dash.error && /* @__PURE__ */ jsx("p", {
			className: "mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive",
			children: dash.error
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-4",
			children: [
				{
					icon: TrendingUp,
					label: "Revenue",
					value: money(metrics?.revenue ?? 0, lang)
				},
				{
					icon: Package,
					label: "Orders",
					value: String(metrics?.orders ?? 0)
				},
				{
					icon: Clock,
					label: "On-time delivery",
					value: `${metrics?.onTimeRate ?? 0}%`
				},
				{
					icon: Star,
					label: "Units sold",
					value: String(metrics?.unitsSold ?? 0)
				}
			].map((s) => /* @__PURE__ */ jsxs("div", {
				className: "card-surface p-4",
				children: [
					/* @__PURE__ */ jsx(s.icon, { className: "size-5 text-primary" }),
					/* @__PURE__ */ jsx("div", {
						className: "mt-2 font-display text-xl font-bold",
						children: dash.loading ? "…" : s.value
					}),
					/* @__PURE__ */ jsx("div", {
						className: "text-[11px] text-muted-foreground",
						children: s.label
					})
				]
			}, s.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-[1fr_360px]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display font-bold",
							children: "Add a new listing"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-xs text-muted-foreground",
							children: "Published straight to your shop — ownership is verified server-side."
						}),
						/* @__PURE__ */ jsx(ListingForm, { onSubmit: createListing })
					]
				}), /* @__PURE__ */ jsxs("section", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display font-bold",
							children: "Your listings"
						}),
						dash.loading && /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "Loading listings…"
						}),
						!dash.loading && listings.length === 0 && /* @__PURE__ */ jsx("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: "No listings yet — publish your first product above."
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-2 divide-y divide-border",
							children: listings.map((p) => /* @__PURE__ */ jsx(ListingRow, {
								product: p,
								sellerId: shop?._id,
								onChanged: dash.reload
							}, p._id))
						})
					]
				})]
			}), /* @__PURE__ */ jsxs("aside", {
				className: "card-surface h-fit space-y-3 p-5",
				children: [
					/* @__PURE__ */ jsxs("h2", {
						className: "flex items-center gap-2 font-display font-bold",
						children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-primary" }), " AI decision support"]
					}),
					(data?.insights ?? []).length === 0 && /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "No recommendations right now — your listings look healthy."
					}),
					(data?.insights ?? []).map((i, idx) => /* @__PURE__ */ jsxs("div", {
						className: "rounded-xl bg-secondary p-3",
						children: [/* @__PURE__ */ jsx("span", {
							className: "text-[10px] font-bold uppercase tracking-wide text-primary",
							children: i.tag
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm leading-snug",
							children: i.text
						})]
					}, `${i.tag}-${idx}`))
				]
			})]
		})
	] });
}
function ListingRow({ product, sellerId, onChanged }) {
	const { lang } = useLang();
	const mine = product.offers.find((o) => {
		const id = typeof o.seller === "string" ? o.seller : o.seller?._id;
		return !sellerId || String(id) === String(sellerId);
	});
	const [price, setPrice] = useState(String(mine?.price ?? product.price));
	const [stock, setStock] = useState(String(mine?.stock ?? 0));
	const [busy, setBusy] = useState(null);
	const cheapest = Math.min(...product.offers.map((o) => o.price));
	const save = async () => {
		setBusy("save");
		try {
			await api.sellers.updateProduct(product.slug, {
				price: Number(price),
				stock: Number(stock)
			});
			onChanged();
		} finally {
			setBusy(null);
		}
	};
	const remove = async () => {
		setBusy("delete");
		try {
			await api.sellers.deleteProduct(product.slug);
			onChanged();
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-wrap items-center gap-3 py-3",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-lg",
				children: product.image ? /* @__PURE__ */ jsx("img", {
					src: product.image,
					alt: "",
					className: "size-full object-cover"
				}) : product.emoji ?? "📦"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "min-w-40 flex-1",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm font-medium",
					children: lang === "bn" && product.nameBn ? product.nameBn : product.name
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[11px] text-muted-foreground",
					children: [product.category, mine && mine.price > cheapest && /* @__PURE__ */ jsxs("span", {
						className: "ml-2 text-destructive",
						children: [money(mine.price - cheapest, lang), " above lowest"]
					})]
				})]
			}),
			/* @__PURE__ */ jsx("input", {
				value: price,
				onChange: (e) => setPrice(e.target.value),
				type: "number",
				className: "w-24 rounded-lg border border-input bg-background px-2 py-1.5 text-sm",
				"aria-label": "Price"
			}),
			/* @__PURE__ */ jsx("input", {
				value: stock,
				onChange: (e) => setStock(e.target.value),
				type: "number",
				className: "w-20 rounded-lg border border-input bg-background px-2 py-1.5 text-sm",
				"aria-label": "Stock"
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: save,
				disabled: busy !== null,
				className: "rounded-lg border border-border p-2 hover:bg-secondary",
				"aria-label": "Save listing",
				children: busy === "save" ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "size-4" })
			}),
			/* @__PURE__ */ jsx("button", {
				onClick: remove,
				disabled: busy !== null,
				className: "rounded-lg border border-border p-2 text-destructive hover:bg-secondary",
				"aria-label": "Remove listing",
				children: busy === "delete" ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
			})
		]
	});
}
//#endregion
//#region src/routes/wishlist.tsx
var Route$1 = createFileRoute("/wishlist")({
	head: () => ({ meta: [
		{ title: "Wishlist — HyperLocal" },
		{
			name: "description",
			content: "Save products for later, watch price drops and move items to your cart."
		},
		{
			property: "og:title",
			content: "Wishlist — HyperLocal"
		},
		{
			property: "og:description",
			content: "Your saved products with price-drop alerts."
		}
	] }),
	component: WishlistPage
});
function WishlistPage() {
	const { t } = useLang();
	const wishlist = useAsync(() => api.users.wishlist(), [], true);
	const items = wishlist.data?.items ?? [];
	return /* @__PURE__ */ jsxs(Layout, { children: [
		/* @__PURE__ */ jsx("h1", {
			className: "font-display text-2xl font-bold",
			children: t("wishlist")
		}),
		/* @__PURE__ */ jsx("p", {
			className: "text-sm text-muted-foreground",
			children: "Price-drop alerts are on for every saved item."
		}),
		wishlist.error && /* @__PURE__ */ jsx("p", {
			className: "mt-2 text-sm text-destructive",
			children: wishlist.error
		}),
		items.length === 0 ? /* @__PURE__ */ jsxs("div", {
			className: "card-surface mt-6 flex flex-col items-center gap-3 p-12 text-center",
			children: [
				/* @__PURE__ */ jsx(Heart, { className: "size-10 text-muted-foreground" }),
				/* @__PURE__ */ jsx("p", {
					className: "text-sm text-muted-foreground",
					children: t("emptyWishlist")
				}),
				/* @__PURE__ */ jsx(Link, {
					to: "/search",
					search: {
						q: "",
						category: void 0
					},
					className: "rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
					children: "Browse products"
				})
			]
		}) : /* @__PURE__ */ jsx("div", {
			className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: items.map((p) => /* @__PURE__ */ jsx(ProductCard, {
				product: p,
				reason: p.oldPrice ? "Price dropped since you saved it" : void 0
			}, p._id))
		})
	] });
}
//#endregion
//#region src/routes/product.$productId.tsx
var Route = createFileRoute("/product/$productId")({
	head: ({ params }) => ({ meta: [{ title: `Product ${params.productId} — HyperLocal` }, {
		name: "description",
		content: "Product details, seller comparison and AI review summary."
	}] }),
	component: ProductPage
});
function sellerId(offer) {
	return typeof offer.seller === "string" ? offer.seller : offer.seller._id;
}
function ProductPage() {
	const { productId } = Route.useParams();
	const { lang, t } = useLang();
	const { addToCart, wishlist, toggleWishlist, markViewed } = useStore();
	const [tab, setTab] = useState("summary");
	const [showFlagged, setShowFlagged] = useState(false);
	const [added, setAdded] = useState(false);
	const detail = useAsync(() => api.products.detail(productId), [productId], true);
	const recos = useAsync(() => api.products.recommendations(), [productId], true);
	const product = detail.data?.product;
	const reviews = detail.data?.reviews ?? [];
	const sortedOffers = product ? [...product.offers].sort((a, b) => a.price - b.price) : [];
	const [selectedSellerId, setSelectedSellerId] = useState("");
	useEffect(() => {
		if (!product || sortedOffers.length === 0) return;
		setSelectedSellerId(sellerId(sortedOffers[0]));
		markViewed(product.slug);
	}, [
		productId,
		product,
		sortedOffers,
		markViewed
	]);
	if (detail.loading || !product) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2 p-10 text-muted-foreground",
		children: [/* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }), " Loading product..."]
	}) });
	if (detail.error) return /* @__PURE__ */ jsx(Layout, { children: /* @__PURE__ */ jsx("p", {
		className: "text-sm text-destructive",
		children: detail.error
	}) });
	const selectedOffer = sortedOffers.find((o) => sellerId(o) === selectedSellerId) ?? sortedOffers[0];
	const selectedSeller = typeof selectedOffer.seller === "string" ? null : selectedOffer.seller;
	const flagged = reviews.filter((r) => r.suspicious);
	const genuine = reviews.filter((r) => !r.suspicious);
	const genuineAvg = genuine.length > 0 ? (genuine.reduce((sum, r) => sum + Number(r.rating || 0), 0) / genuine.length).toFixed(1) : "0.0";
	return /* @__PURE__ */ jsxs(Layout, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-8 lg:grid-cols-2",
			children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("div", {
				className: "flex h-80 items-center justify-center rounded-3xl text-8xl shadow-soft",
				style: product.image ? { backgroundImage: product.image } : void 0,
				children: product.emoji ?? "📦"
			}) }), /* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-xs font-semibold uppercase tracking-wide text-primary",
					children: product.brand
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "mt-1 font-display text-2xl font-bold md:text-3xl",
					children: lang === "bn" && product.nameBn ? product.nameBn : product.name
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ jsx(Star, { className: "size-4 fill-accent text-accent" }),
							" ",
							product.rating ?? 0,
							" (",
							product.reviewCount ?? reviews.length,
							" ",
							t("reviews"),
							")"
						]
					}), /* @__PURE__ */ jsxs("span", {
						className: "rounded-full bg-secondary px-2 py-0.5 text-xs",
						children: [product.offers.length, " sellers"]
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-4 text-sm leading-relaxed text-muted-foreground",
					children: product.description || "No description available."
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "mb-2 font-display font-bold",
						children: t("compareSellers")
					}), /* @__PURE__ */ jsx("div", {
						className: "space-y-2",
						children: sortedOffers.map((o, i) => {
							const id = sellerId(o);
							const s = typeof o.seller === "string" ? null : o.seller;
							return /* @__PURE__ */ jsxs("button", {
								onClick: () => setSelectedSellerId(id),
								className: "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors " + (id === selectedSellerId ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"),
								children: [/* @__PURE__ */ jsxs("div", {
									className: "flex-1",
									children: [/* @__PURE__ */ jsxs("div", {
										className: "flex items-center gap-1.5 text-sm font-semibold",
										children: [
											s ? lang === "bn" && s.nameBn ? s.nameBn : s.name : "Seller",
											s?.verified && /* @__PURE__ */ jsx(ShieldCheck, { className: "size-3.5 text-success" }),
											i === 0 && /* @__PURE__ */ jsx("span", {
												className: "rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground",
												children: "BEST PRICE"
											})
										]
									}), /* @__PURE__ */ jsxs("div", {
										className: "mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground",
										children: [
											/* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ jsx(MapPin, { className: "size-3" }), s?.area ?? ""]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ jsx(Truck, { className: "size-3" }), o.delivery ?? ""]
											}),
											/* @__PURE__ */ jsxs("span", {
												className: "flex items-center gap-1",
												children: [/* @__PURE__ */ jsx(Star, { className: "size-3 fill-accent text-accent" }), s?.rating ?? "-"]
											}),
											/* @__PURE__ */ jsxs("span", { children: [o.stock, " in stock"] })
										]
									})]
								}), /* @__PURE__ */ jsx("div", {
									className: "font-display text-lg font-bold",
									children: money(o.price, lang)
								})]
							}, id);
						})
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-5 flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
							className: "font-display text-3xl font-extrabold",
							children: money(selectedOffer.price, lang)
						}), product.oldPrice && /* @__PURE__ */ jsx("div", {
							className: "text-sm text-muted-foreground line-through",
							children: money(product.oldPrice, lang)
						})] }),
						/* @__PURE__ */ jsx("button", {
							onClick: () => {
								addToCart(product.slug, sellerId(selectedOffer));
								setAdded(true);
								window.setTimeout(() => setAdded(false), 1800);
							},
							className: "rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90",
							children: added ? "✓ Added" : t("addToCart")
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/checkout",
							onClick: () => void addToCart(product.slug, sellerId(selectedOffer)),
							className: "rounded-xl bg-accent-gradient px-5 py-3 text-sm font-bold text-accent-foreground",
							children: t("buyNow")
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => void toggleWishlist(product._id),
							className: "rounded-xl border border-border p-3 hover:bg-secondary",
							"aria-label": t("wishlist"),
							children: /* @__PURE__ */ jsx(Heart, { className: "size-5 " + (wishlist.includes(product._id) ? "fill-destructive text-destructive" : "") })
						})
					]
				}),
				selectedSeller && /* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: ["Selected seller: ", selectedSeller.name]
				})
			] })]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mb-3 flex items-center gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					onClick: () => setTab("summary"),
					className: "rounded-lg px-3 py-1.5 text-sm font-semibold " + (tab === "summary" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"),
					children: t("aiSummary")
				}), /* @__PURE__ */ jsxs("button", {
					onClick: () => setTab("all"),
					className: "rounded-lg px-3 py-1.5 text-sm font-semibold " + (tab === "all" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"),
					children: [
						t("reviews"),
						" (",
						reviews.length,
						")"
					]
				})]
			}), tab === "summary" ? /* @__PURE__ */ jsxs("div", {
				className: "grid gap-4 md:grid-cols-[2fr_1fr]",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5",
					children: [/* @__PURE__ */ jsxs("h3", {
						className: "flex items-center gap-2 font-display font-bold",
						children: [
							/* @__PURE__ */ jsx(Sparkles, { className: "size-4 text-primary" }),
							" ",
							t("aiSummary")
						]
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: detail.data?.aiSummary || "No summary available yet."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "card-surface p-5",
					children: [
						/* @__PURE__ */ jsxs("h3", {
							className: "flex items-center gap-2 font-display font-bold",
							children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "size-4 text-destructive" }), " Fake review detection"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: [
								flagged.length,
								" of ",
								reviews.length,
								" reviews flagged as suspicious."
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex items-center gap-4",
							children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "font-display text-2xl font-bold",
								children: product.rating ?? 0
							}), /* @__PURE__ */ jsx("div", {
								className: "text-[11px] text-muted-foreground",
								children: "listed rating"
							})] }), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", {
								className: "font-display text-2xl font-bold text-success",
								children: genuineAvg
							}), /* @__PURE__ */ jsx("div", {
								className: "text-[11px] text-muted-foreground",
								children: "verified-only rating"
							})] })]
						}),
						/* @__PURE__ */ jsx("button", {
							onClick: () => {
								setTab("all");
								setShowFlagged(true);
							},
							className: "mt-3 text-xs font-semibold text-primary underline",
							children: "Show flagged reviews"
						})
					]
				})]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "space-y-3",
				children: [/* @__PURE__ */ jsxs("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ jsx("input", {
						type: "checkbox",
						checked: showFlagged,
						onChange: (e) => setShowFlagged(e.target.checked),
						className: "accent-primary"
					}), "Include flagged reviews"]
				}), reviews.filter((r) => showFlagged || !r.suspicious).map((r) => /* @__PURE__ */ jsxs("div", {
					className: "card-surface p-4 " + (r.suspicious ? "border-destructive/50" : ""),
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ jsx("span", {
									className: "flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-bold",
									children: r.authorName.slice(0, 2).toUpperCase()
								}), /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
									className: "text-sm font-semibold",
									children: r.authorName
								}), /* @__PURE__ */ jsx("p", {
									className: "text-[11px] text-muted-foreground",
									children: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""
								})] })]
							}), /* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-1 text-sm",
								children: [r.rating, /* @__PURE__ */ jsx(Star, { className: "size-3.5 fill-accent text-accent" })]
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm",
							children: r.text
						}),
						r.suspicious ? /* @__PURE__ */ jsxs("p", {
							className: "mt-2 flex items-start gap-1.5 rounded-lg bg-destructive/10 p-2 text-xs text-destructive",
							children: [/* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 size-3.5 shrink-0" }), /* @__PURE__ */ jsxs("span", { children: [
								/* @__PURE__ */ jsxs("strong", { children: [t("flagged"), ":"] }),
								" ",
								r.reason
							] })]
						}) : /* @__PURE__ */ jsxs("p", {
							className: "mt-2 flex items-center gap-1 text-xs text-success",
							children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "size-3.5" }), " Verified purchase"]
						})
					]
				}, r._id))]
			})]
		}),
		/* @__PURE__ */ jsxs("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-xl font-bold",
				children: t("recommended")
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: (recos.data?.items ?? []).filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => /* @__PURE__ */ jsx(ProductCard, { product: p }, p._id))
			})]
		})
	] });
}
//#endregion
//#region src/routeTree.gen.ts
var rootRouteChildren = {
	IndexRoute: Route$11.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$12
	}),
	CartRoute: Route$10.update({
		id: "/cart",
		path: "/cart",
		getParentRoute: () => Route$12
	}),
	CheckoutRoute: Route$9.update({
		id: "/checkout",
		path: "/checkout",
		getParentRoute: () => Route$12
	}),
	LoginRoute: Route$8.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$12
	}),
	OrdersRoute: Route$7.update({
		id: "/orders",
		path: "/orders",
		getParentRoute: () => Route$12
	}),
	ProfileRoute: Route$6.update({
		id: "/profile",
		path: "/profile",
		getParentRoute: () => Route$12
	}),
	RegisterRoute: Route$5.update({
		id: "/register",
		path: "/register",
		getParentRoute: () => Route$12
	}),
	RewardsRoute: Route$4.update({
		id: "/rewards",
		path: "/rewards",
		getParentRoute: () => Route$12
	}),
	SearchRoute: Route$3.update({
		id: "/search",
		path: "/search",
		getParentRoute: () => Route$12
	}),
	SellerRoute: Route$2.update({
		id: "/seller",
		path: "/seller",
		getParentRoute: () => Route$12
	}),
	WishlistRoute: Route$1.update({
		id: "/wishlist",
		path: "/wishlist",
		getParentRoute: () => Route$12
	}),
	ProductProductIdRoute: Route.update({
		id: "/product/$productId",
		path: "/product/$productId",
		getParentRoute: () => Route$12
	})
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
//#endregion
//#region src/router.tsx
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
