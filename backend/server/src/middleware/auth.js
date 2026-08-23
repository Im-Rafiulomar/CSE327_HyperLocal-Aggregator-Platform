import { User } from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { unauthorized, forbidden, asyncHandler } from "../utils/errors.js";

/** Requires a valid Bearer access token; attaches req.user. */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw unauthorized("Missing access token");

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw unauthorized("Invalid or expired token");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw unauthorized("User no longer exists");

  req.user = user;
  next();
});

/** Attaches req.user when a token is present, but never rejects. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next();
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = await User.findById(payload.sub);
  } catch {
    /* ignore — treated as anonymous */
  }
  next();
});

/** Role gate. Roles are read from the DB user, never from client input. */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next(forbidden("Insufficient role"));
    next();
  };
