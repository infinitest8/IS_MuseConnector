import { PRIMARY_GOALS, PRIMARY_GOAL_VALUES, assertPrimaryGoal } from "./goals.js";

export const DEVELOPMENT_SESSION_CATALOG = Object.freeze({
  [PRIMARY_GOALS.STRESS]: Object.freeze({
    goal: PRIMARY_GOALS.STRESS,
    title: "DEV PLACEHOLDER - Stress meditation pending user confirmation",
    url: null,
    duration: null,
    is_premium: null,
    source: "development_placeholder"
  }),
  [PRIMARY_GOALS.SLEEP]: Object.freeze({
    goal: PRIMARY_GOALS.SLEEP,
    title: "DEV PLACEHOLDER - Sleep meditation pending user confirmation",
    url: null,
    duration: null,
    is_premium: null,
    source: "development_placeholder"
  }),
  [PRIMARY_GOALS.FOCUS]: Object.freeze({
    goal: PRIMARY_GOALS.FOCUS,
    title: "DEV PLACEHOLDER - Focus meditation pending user confirmation",
    url: null,
    duration: null,
    is_premium: null,
    source: "development_placeholder"
  })
});

export function createProductionCatalog(sessionsByGoal) {
  const catalog = {};

  for (const goal of PRIMARY_GOAL_VALUES) {
    const session = sessionsByGoal?.[goal];
    validateProductionSession(goal, session);
    catalog[goal] = {
      goal,
      title: session.title.trim(),
      url: session.url.trim(),
      duration: session.duration,
      is_premium: Boolean(session.is_premium),
      source: "user_confirmed_infinite_state"
    };
  }

  return Object.freeze(catalog);
}

export function getSessionForGoal(catalog, goal) {
  assertPrimaryGoal(goal);
  const session = catalog?.[goal];
  if (!session) {
    throw new Error(`No session configured for ${goal}`);
  }
  return session;
}

export function isProductionCatalogReady(catalog) {
  return PRIMARY_GOAL_VALUES.every((goal) => {
    const session = catalog?.[goal];
    return Boolean(
      session &&
        session.source === "user_confirmed_infinite_state" &&
        session.title &&
        session.url &&
        session.duration &&
        typeof session.is_premium === "boolean"
    );
  });
}

function validateProductionSession(goal, session) {
  if (!session || typeof session !== "object") {
    throw new Error(`Missing user-confirmed production session for ${goal}`);
  }

  const missingFields = ["title", "url", "duration"].filter((field) => !session[field]);
  if (typeof session.is_premium !== "boolean") missingFields.push("is_premium");

  if (missingFields.length > 0) {
    throw new Error(`Production session for ${goal} is missing: ${missingFields.join(", ")}`);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(session.url);
  } catch {
    throw new Error(`Production session for ${goal} must use an exact valid Infinite State URL`);
  }

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    throw new Error(`Production session for ${goal} must use an HTTP(S) URL`);
  }
}
