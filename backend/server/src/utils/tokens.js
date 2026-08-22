/** Facade over TokenService so existing imports keep working. */
import { tokenService } from "../services/auth/TokenService.js";

export const signAccessToken = (user) => tokenService.signAccess(user);
export const signRefreshToken = (user) => tokenService.signRefresh(user);
export const verifyAccessToken = (token) => tokenService.verifyAccess(token);
export const verifyRefreshToken = (token) => tokenService.verifyRefresh(token);
export const refreshCookieOptions = tokenService.cookieOptions;
