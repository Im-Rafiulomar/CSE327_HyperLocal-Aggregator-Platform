/** Facade over RecommendationEngine (see services/recommendation/). */
import { recommendationEngine } from "./recommendation/RecommendationEngine.js";

export const recommendForUser = (user, limit = 8) => recommendationEngine.recommend(user, limit);
