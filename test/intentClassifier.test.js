import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyIntent, PRIMARY_GOALS } from "../src/index.js";

describe("classifyIntent", () => {
  const cases = [
    ["I'm anxious about my presentation.", PRIMARY_GOALS.STRESS],
    ["I need to focus on my presentation.", PRIMARY_GOALS.FOCUS],
    ["My mind is racing and I need to sleep.", PRIMARY_GOALS.SLEEP],
    ["My mind is racing but I have to finish this report.", PRIMARY_GOALS.FOCUS],
    ["I'm mentally exhausted and need to unwind.", PRIMARY_GOALS.STRESS],
    ["I'm mentally exhausted and need to get some work done.", PRIMARY_GOALS.FOCUS],
    ["I'm mentally exhausted but need to work for another hour.", PRIMARY_GOALS.FOCUS],
    ["I'm tired and want to take a nap.", PRIMARY_GOALS.SLEEP],
    ["I'm tired and need to stay focused for a meeting.", PRIMARY_GOALS.FOCUS],
    ["I need a reset before bed.", PRIMARY_GOALS.SLEEP],
    ["I need to calm down before my presentation.", PRIMARY_GOALS.STRESS],
    ["focus for 20 minutes", PRIMARY_GOALS.FOCUS]
  ];

  for (const [input, expectedGoal] of cases) {
    it(`maps "${input}" to ${expectedGoal}`, () => {
      assert.equal(classifyIntent(input).primary_goal, expectedGoal);
    });
  }

  it("returns the required public shape", () => {
    const result = classifyIntent("I need focus music for 20 minutes this afternoon.");

    assert.deepEqual(Object.keys(result), [
      "primary_goal",
      "confidence",
      "reasoning_summary",
      "detected_intents",
      "duration_if_present",
      "time_context_if_present",
      "content_preference_if_present"
    ]);
    assert.equal(result.primary_goal, PRIMARY_GOALS.FOCUS);
    assert.deepEqual(result.duration_if_present, { value: 20, unit: "minutes" });
    assert.equal(result.time_context_if_present, "afternoon");
    assert.equal(result.content_preference_if_present, "focus music");
    assert.ok(result.confidence > 0 && result.confidence <= 1);
    assert.ok(!result.reasoning_summary.includes("chain"));
  });

  it("returns a lower-confidence plausible fallback for unclear input", () => {
    const result = classifyIntent("meditation");

    assert.equal(result.primary_goal, PRIMARY_GOALS.STRESS);
    assert.ok(result.confidence < 0.6);
  });
});
