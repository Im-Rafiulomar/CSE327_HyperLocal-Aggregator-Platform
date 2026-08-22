import { ApiError } from "../utils/errors.js";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err?.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.errors });
  }
  if (err?.code === 11000) {
    return res.status(409).json({ error: "Duplicate value", details: err.keyValue });
  }
  console.error("[error]", err);
  res.status(500).json({ error: "Internal server error" });
}
