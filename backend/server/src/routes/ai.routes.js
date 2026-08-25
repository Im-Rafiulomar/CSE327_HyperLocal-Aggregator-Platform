import express from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/errors.js";
import { assistantService } from "../services/assistant/AssistantService.js";
import { searchService } from "../services/search/SearchService.js";
import { visionService } from "../services/ai/VisionService.js";
import { speechService } from "../services/ai/SpeechService.js";
import { getAiProvider } from "../services/ai/AiProvider.js";

const router = express.Router();

/** Model calls cost money — they get their own tighter budget. */
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.get("/status", (_req, res) => res.json({ aiEnabled: getAiProvider().available }));

router.post(
  "/assistant",
  aiLimiter,
  optionalAuth,
  validate(z.object({ message: z.string().trim().min(1).max(500) })),
  asyncHandler(async (req, res) => {
    res.json(await assistantService.answer(req.body.message, req.user));
  }),
);

/**
 * Camera / photo product search. Send a base64 data URL and the vision model
 * detects the product; `labels` are optional client-side hints used as a
 * fallback when AI is not configured.
 */
router.post(
  "/image-search",
  aiLimiter,
  optionalAuth,
  validate(
    z.object({
      image: z
        .string()
        .regex(/^data:image\/(png|jpe?g|webp);base64,/, "Send a PNG, JPEG or WebP data URL")
        .max(8_000_000)
        .optional(),
      labels: z.array(z.string().trim().max(40)).max(10).default([]),
      limit: z.number().int().min(1).max(24).default(8),
    }),
  ),
  asyncHandler(async (req, res) => {
    res.json(await visionService.search(req.body));
  }),
);

/** Back-compat: label-only visual search. */
router.post(
  "/visual-search",
  validate(z.object({ labels: z.array(z.string().max(40)).min(1).max(10) })),
  asyncHandler(async (req, res) => {
    res.json(await searchService.search("visual", { labels: req.body.labels }));
  }),
);

/** AI voice search: recorded audio (or a Web Speech transcript) in, products out. */
router.post(
  "/voice-search",
  aiLimiter,
  optionalAuth,
  validate(
    z
      .object({
        audio: z.string().max(30_000_000).optional(),
        mimeType: z.string().max(100).optional(),
        language: z.string().max(50).optional(),
        transcript: z.string().trim().max(4000).optional(),
      })
      .refine((v) => Boolean((v.audio && v.audio.length > 0) || (v.transcript && v.transcript.length > 0)), {
        message: "Send audio or a transcript",
      }),
  ),
  asyncHandler(async (req, res) => {
    res.json(await speechService.search(req.body));
  }),
);

export default router;
