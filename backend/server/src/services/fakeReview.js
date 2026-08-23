/**
 * Facade kept for backwards compatibility — the logic now lives in
 * services/review/ReviewAnalyzer.js (rules are pluggable there).
 */
import { reviewAnalyzer } from "./review/ReviewAnalyzer.js";

export const analyzeReview = (input) => reviewAnalyzer.analyze(input);
export const summarizeReviews = (reviews) => reviewAnalyzer.summarize(reviews);
