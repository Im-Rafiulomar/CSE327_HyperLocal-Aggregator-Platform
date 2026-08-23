import { describe, it, expect } from "vitest";
import { ReviewRule, defaultRules } from "../../../src/services/review/rules.js";

function ruleNamed(name) {
  const rule = defaultRules.find((r) => r.name === name);
  if (!rule) throw new Error(`No rule named ${name} in defaultRules`);
  return rule;
}

describe("ReviewRule", () => {
  it("returns a penalty/message object when its test passes", () => {
    const rule = new ReviewRule("always", 10, "always fires", () => true);
    expect(rule.evaluate({})).toEqual({ penalty: 10, message: "always fires" });
  });

  it("returns null when its test fails", () => {
    const rule = new ReviewRule("never", 10, "never fires", () => false);
    expect(rule.evaluate({})).toBeNull();
  });
});

describe("defaultRules: too-short", () => {
  const rule = ruleNamed("too-short");

  it("flags review text under 25 characters", () => {
    expect(rule.evaluate({ lower: "great" })).not.toBeNull();
  });

  it("does not flag review text at or above 25 characters", () => {
    const lower = "a".repeat(25);
    expect(rule.evaluate({ lower })).toBeNull();
  });
});

describe("defaultRules: generic", () => {
  const rule = ruleNamed("generic");

  it("flags known generic promotional phrases", () => {
    expect(rule.evaluate({ lower: "this is the best product ever for sure" })).not.toBeNull();
  });

  it("is case-insensitive because callers pass lowercased text", () => {
    expect(rule.evaluate({ lower: "must buy right now" })).not.toBeNull();
  });

  it("does not flag ordinary descriptive text", () => {
    expect(rule.evaluate({ lower: "the fabric felt thinner than i expected but colour matched" })).toBeNull();
  });
});

describe("defaultRules: extreme-rating", () => {
  const rule = ruleNamed("extreme-rating");

  it("flags a 5-star rating with little detail", () => {
    expect(rule.evaluate({ rating: 5, lower: "great" })).not.toBeNull();
  });

  it("flags a 1-star rating with little detail", () => {
    expect(rule.evaluate({ rating: 1, lower: "bad" })).not.toBeNull();
  });

  it("does not flag a 5-star rating with a detailed explanation", () => {
    const lower = "excellent build quality and the delivery was faster than expected overall";
    expect(rule.evaluate({ rating: 5, lower })).toBeNull();
  });

  it("does not flag a mid-range rating regardless of length", () => {
    expect(rule.evaluate({ rating: 3, lower: "ok" })).toBeNull();
  });
});

describe("defaultRules: punctuation", () => {
  const rule = ruleNamed("punctuation");

  it("flags text with 4 or more exclamation marks", () => {
    expect(rule.evaluate({ text: "wow!! amazing!! buy!!" })).not.toBeNull();
  });

  it("does not flag text with fewer than 4 exclamation marks", () => {
    expect(rule.evaluate({ text: "wow! amazing!" })).toBeNull();
  });
});

describe("defaultRules: no-history", () => {
  const rule = ruleNamed("no-history");

  it("flags an account with zero prior reviews", () => {
    expect(rule.evaluate({ historyCount: 0 })).not.toBeNull();
  });

  it("does not flag an account with prior review history", () => {
    expect(rule.evaluate({ historyCount: 3 })).toBeNull();
  });
});

describe("defaultRules: bot-name", () => {
  const rule = ruleNamed("bot-name");

  it("flags auto-generated-looking usernames like user12345", () => {
    expect(rule.evaluate({ authorName: "user12345" })).not.toBeNull();
  });

  it("does not flag a normal human-looking name", () => {
    expect(rule.evaluate({ authorName: "Rafi Ahmed" })).toBeNull();
  });

  it("does not flag a missing author name", () => {
    expect(rule.evaluate({ authorName: undefined })).toBeNull();
  });
});
