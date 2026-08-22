import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { authService } from "../services/auth/AuthService.js";
import { tokenService } from "../services/auth/TokenService.js";
import { Seller } from "../models/Seller.js";

const router = express.Router();

/** Production-grade password policy, enforced on the server. */
const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/\d/, "Add a number");

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255).toLowerCase(),
  password: passwordSchema,
  phone: z.string().trim().max(20).optional(),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  shopName: z.string().trim().min(2).max(80).optional(),
  area: z.string().trim().max(120).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1).max(128),
});

/** Presenter: one place decides what a session response looks like (SRP). */
const sessionPayload = async (user) => ({
  user: user.toPublic(),
  sellerProfile: user.seller ? await Seller.findById(user.seller).lean() : null,
});

/** Routes are thin controllers: validate, delegate to the service, respond. */
const sendSession = async (res, status, { user, accessToken, refreshToken }) => {
  res.cookie("refreshToken", refreshToken, tokenService.cookieOptions);
  res.status(status).json({ ...(await sessionPayload(user)), accessToken });
};

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => await sendSession(res, 201, await authService.register(req.body))),
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => await sendSession(res, 200, await authService.login(req.body))),
);

const googleSchema = z.object({
  credential: z.string().min(20).max(4096),
  role: z.enum(["buyer", "seller"]).default("buyer"),
  shopName: z.string().trim().min(2).max(80).optional(),
  area: z.string().trim().max(120).optional(),
});

router.get("/google/config", (_req, res) => res.json({ clientId: process.env.GOOGLE_CLIENT_ID || null }));

router.post(
  "/google",
  validate(googleSchema),
  asyncHandler(async (req, res) => await sendSession(res, 200, await authService.loginWithGoogle(req.body))),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => await sendSession(res, 200, await authService.refresh(req.cookies?.refreshToken))),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    await authService.logout(req.cookies?.refreshToken);
    res.clearCookie("refreshToken", { ...tokenService.cookieOptions, maxAge: undefined });
    res.json({ ok: true });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => res.json(await sessionPayload(req.user))),
);

export default router;
