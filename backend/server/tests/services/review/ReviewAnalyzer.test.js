import { describe, it, expect } from "vitest";
import { ReviewAnalyzer } from "../../../src/services/review/ReviewAnalyzer.js";
import { ReviewRule } from "../../../src/services/review/rules.js";

describe("ReviewAnalyzer.analyze", () => {
  it("gives a clean, detailed, mid-rating review from an established account a high trust score", () => {
    const analyzer = new ReviewAnalyzer();
    const result = analyzer.analyze({
      text: "Delivery took three days but the packaging was solid and the product matches the listing photos well.",
      rating: 4,
      authorName: "Nusrat Jahan",
      historyCount: 5,
    });

    expect(result.suspicious).toBe(false);
    expect(result.trustScore).toBe(100);
    expect(result.reason).toBe("");
  });

  it("flags a short, generic, first-time, 5-star review as suspicious", () => {
    const analyzer = new ReviewAnalyzer();
    const result = analyzer.analyze({
      text: "best product ever!!!!",
      rating: 5,
      authorName: "user48213",
      historyCount: 0,
    });

    expect(result.suspicious).toBe(true);
    expect(result.trustScore).toBeLessThan(55);
    expect(result.reason).toContain("Generic promotional wording");
  });

  it("never lets the trust score drop below 0 even with many stacked penalties", () => {
    const manyRules = Array.from({ length: 10 }, (_, i) => new ReviewRule(`r${i}`, 30, `hit ${i}`, () => true));
    const analyzer = new ReviewAnalyzer(manyRules);
    const result = analyzer.analyze({ text: "x", rating: 1, authorName: "user1", historyCount: 0 });

    expect(result.trustScore).toBe(0);
    expect(result.suspicious).toBe(true);
  });

  it("respects a custom suspicion threshold", () => {
    const oneRule = [new ReviewRule("small-hit", 10, "small hit", () => true)];
    const strict = new ReviewAnalyzer(oneRule, 95); // trustScore will be 90, below threshold
    const lenient = new ReviewAnalyzer(oneRule, 50); // trustScore 90 is above threshold

    const input = { text: "a".repeat(30), rating: 3, authorName: "Someone", historyCount: 2 };
    expect(strict.analyze(input).suspicious).toBe(true);
    expect(lenient.analyze(input).suspicious).toBe(false);
  });

  it("defaults missing text to an empty string without throwing", () => {
    const analyzer = new ReviewAnalyzer();
    expect(() => analyzer.analyze({ rating: 3, authorName: "Someone", historyCount: 1 })).not.toThrow();
  });
});

describe("ReviewAnalyzer.summarize", () => {
  it("reports there are not enough verified reviews when all are suspicious", () => {
    const analyzer = new ReviewAnalyzer();
    const summary = analyzer.summarize([{ suspicious: true, rating: 5 }]);
    expect(summary).toBe("Not enough verified reviews yet.");
  });

  it("computes average rating and positive percentage from genuine reviews only", () => {
    const analyzer = new ReviewAnalyzer();
    const reviews = [
      { suspicious: false, rating: 5 },
      { suspicious: false, rating: 3 },
      { suspicious: true, rating: 1 },
    ];
    const summary = analyzer.summarize(reviews);

    expect(summary).toContain("2 verified reviews average 4.0★");
    expect(summary).toContain("50% positive");
    expect(summary).toContain("1 review(s) flagged as potentially fake and excluded.");
  });

  it("omits the flagged-review note when nothing was excluded", () => {
    const analyzer = new ReviewAnalyzer();
    const reviews = [{ suspicious: false, rating: 4 }];
    const summary = analyzer.summarize(reviews);

    expect(summary).not.toContain("flagged as potentially fake");
  });
});
