import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import { UPLOAD_ROOT } from "./middleware/upload.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

process.on("unhandledRejection", (reason) => {
  console.error("[api] unhandled rejection:", reason);
});

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:8080").split(","),
    credentials: true,
  }),
);
app.use(express.json({ limit: "15mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Uploaded seller product photos — served as plain static files. Helmet's
// default same-origin Cross-Origin-Resource-Policy would stop the frontend
// (a different origin/port in dev) from rendering these in <img> tags.
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(UPLOAD_ROOT),
);

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 300 }));

app.get("/api/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(port, () => console.log(`[api] http://localhost:${port}`)))
  .catch((err) => {
    console.error("[api] failed to start:", err.message);
    process.exit(1);
  });

export default app;
