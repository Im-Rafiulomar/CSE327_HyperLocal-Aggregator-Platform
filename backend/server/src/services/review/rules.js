/**
 * Each fake-review signal is a small rule object (SRP). The analyzer applies
 * whichever rules it is given, so heuristics can be tuned without rewriting it.
 */
export class ReviewRule {
  constructor(name, penalty, message, test) {
    this.name = name;
    this.penalty = penalty;
    this.message = message;
    this.test = test;
  }

  evaluate(context) {
    return this.test(context) ? { penalty: this.penalty, message: this.message } : null;
  }
}

const GENERIC_PHRASES = [
  "best product ever",
  "highly recommended to everyone",
  "amazing amazing",
  "must buy",
  "5 star",
  "perfect perfect",
  "value for money product good",
];

export const defaultRules = [
  new ReviewRule("too-short", 25, "Very short review text", ({ lower }) => lower.length < 25),
  new ReviewRule("generic", 30, "Generic promotional wording", ({ lower }) =>
    GENERIC_PHRASES.some((p) => lower.includes(p)),
  ),
  new ReviewRule(
    "extreme-rating",
    20,
    "Extreme rating with little detail",
    ({ rating, lower }) => (rating === 5 || rating === 1) && lower.length < 60,
  ),
  new ReviewRule("punctuation", 15, "Excessive punctuation", ({ text }) => (text.match(/!/g) || []).length >= 4),
  new ReviewRule("no-history", 10, "First-ever review from this account", ({ historyCount }) => historyCount === 0),
  new ReviewRule("bot-name", 15, "Auto-generated looking username", ({ authorName }) => /^user\d+$/i.test(authorName || "")),
];
