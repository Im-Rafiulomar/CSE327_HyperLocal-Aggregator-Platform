import { defaultRules } from "./rules.js";

/** Scores a review against the configured rules and summarises verified ones. */
export class ReviewAnalyzer {
  constructor(rules = defaultRules, threshold = 55) {
    this.rules = rules;
    this.threshold = threshold;
  }

  analyze({ text = "", rating, authorName, historyCount = 0 }) {
    const context = { text, lower: text.toLowerCase(), rating, authorName, historyCount };
    const hits = this.rules.map((r) => r.evaluate(context)).filter(Boolean);
    const score = Math.max(0, Math.min(100, 100 - hits.reduce((s, h) => s + h.penalty, 0)));
    return {
      suspicious: score < this.threshold,
      reason: hits.map((h) => h.message).join(" · "),
      trustScore: score,
    };
  }

  summarize(reviews) {
    const genuine = reviews.filter((r) => !r.suspicious);
    if (genuine.length === 0) return "Not enough verified reviews yet.";
    const avg = genuine.reduce((s, r) => s + r.rating, 0) / genuine.length;
    const positive = genuine.filter((r) => r.rating >= 4).length;
    const flagged = reviews.length - genuine.length;
    return `${genuine.length} verified reviews average ${avg.toFixed(1)}★ — ${Math.round(
      (positive / genuine.length) * 100,
    )}% positive.${flagged ? ` ${flagged} review(s) flagged as potentially fake and excluded.` : ""}`;
  }
}

export const reviewAnalyzer = new ReviewAnalyzer();
