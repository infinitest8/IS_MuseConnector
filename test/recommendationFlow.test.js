import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createProductionCatalog,
  DEVELOPMENT_SESSION_CATALOG,
  INFINITE_STATE_MVP_SESSION_CATALOG,
  isProductionCatalogReady,
  recommendMeditation
} from "../src/index.js";

describe("recommendation flow", () => {
  it("routes to clearly labeled development placeholders until final sessions are confirmed", () => {
    const result = recommendMeditation("I need to sleep.");

    assert.equal(result.primary_goal, "SLEEP");
    assert.equal(result.recommendation.source, "development_placeholder");
    assert.equal(result.recommendation.url, null);
    assert.match(result.recommendation.title, /^DEV PLACEHOLDER/);
    assert.equal(isProductionCatalogReady(DEVELOPMENT_SESSION_CATALOG), false);
  });

  it("requires exactly one complete production session per primary goal", () => {
    assert.throws(
      () =>
        createProductionCatalog({
          STRESS: {
            title: "Stress Session",
            url: "https://example.com/stress",
            duration: "10 minutes",
            is_premium: false
          }
        }),
      /Missing user-confirmed production session for SLEEP/
    );
  });

  it("adds referral attribution only to confirmed URLs", () => {
    const catalog = createProductionCatalog({
      STRESS: {
        title: "Stress Session",
        url: "https://example.com/stress",
        duration: "10 minutes",
        is_premium: false
      },
      SLEEP: {
        title: "Sleep Session",
        url: "https://example.com/sleep?existing=1",
        duration: "20 minutes",
        is_premium: true
      },
      FOCUS: {
        title: "Focus Session",
        url: "https://example.com/focus",
        duration: "15 minutes",
        is_premium: false
      }
    });

    const result = recommendMeditation("I need to sleep", {
      catalog,
      attribution: { partner: "muse_test" }
    });

    const url = new URL(result.recommendation.url);
    assert.equal(url.pathname, "/sleep");
    assert.equal(url.searchParams.get("existing"), "1");
    assert.equal(url.searchParams.get("utm_source"), "muse");
    assert.equal(url.searchParams.get("utm_medium"), "connector");
    assert.equal(url.searchParams.get("utm_campaign"), "infinite_state_meditations");
    assert.equal(url.searchParams.get("partner"), "muse_test");
  });

  it("routes Stress, Sleep, and Focus requests to the user-selected MVP sessions", () => {
    const cases = [
      {
        input: "I am overwhelmed and need to calm down.",
        goal: "STRESS",
        title: "REDUCE STRESS w/ ALPHA BINAURAL BEATS",
        pathname: "/alpha/i/78135007/sound-217",
        duration: "11:11"
      },
      {
        input: "My mind is racing and I need to sleep.",
        goal: "SLEEP",
        title: "DRIFT OFF TO DEEP SLEEP w/ DELTA BINAURAL BEATS",
        pathname: "/delta/i/78135297/sound-225",
        duration: "55:55 minutes"
      },
      {
        input: "I need to focus for 20 minutes.",
        goal: "FOCUS",
        title: "INCREASE FOCUS w/ BETA BINAURAL BEATS",
        pathname: "/beta/i/78134096/sound-213",
        duration: "22:22"
      }
    ];

    assert.equal(isProductionCatalogReady(INFINITE_STATE_MVP_SESSION_CATALOG), true);

    for (const testCase of cases) {
      const result = recommendMeditation(testCase.input, {
        catalog: INFINITE_STATE_MVP_SESSION_CATALOG
      });
      const url = new URL(result.recommendation.url);

      assert.equal(result.primary_goal, testCase.goal);
      assert.equal(result.recommendation.goal, testCase.goal);
      assert.equal(result.recommendation.title, testCase.title);
      assert.equal(url.hostname, "www.infinitestate.app");
      assert.equal(url.pathname, testCase.pathname);
      assert.equal(url.searchParams.get("utm_source"), "muse");
      assert.equal(url.searchParams.get("utm_medium"), "connector");
      assert.equal(url.searchParams.get("utm_campaign"), "infinite_state_meditations");
      assert.equal(result.recommendation.duration, testCase.duration);
      assert.equal(result.recommendation.is_premium, false);
      assert.equal(result.recommendation.source, "user_confirmed_infinite_state");
    }
  });
});
