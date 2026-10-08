import { recommendMeditation } from "./recommendationFlow.js";
import { INFINITE_STATE_MVP_SESSION_CATALOG } from "./productionCatalog.js";

export function recommendForMuse(text) {
  return recommendMeditation(text, {
    catalog: INFINITE_STATE_MVP_SESSION_CATALOG,
    attribution: { utm_source: "muse" }
  });
}

export function recommendForChatGPT(input) {
  return recommendForMcp(input, { utm_source: "chatgpt", utm_medium: "plugin" });
}

export function recommendForClaude(input) {
  return recommendForMcp(input, { utm_source: "claude", utm_medium: "connector" });
}

export function recommendForGrok(input) {
  return recommendForMcp(input, { utm_source: "grok", utm_medium: "connector" });
}

function recommendForMcp(input, attribution) {
  const result = recommendMeditation(input, {
    catalog: INFINITE_STATE_MVP_SESSION_CATALOG,
    attribution
  });
  return {
    primary_goal: result.primary_goal,
    title: result.recommendation.title,
    description: result.recommendation.description,
    duration: result.recommendation.duration,
    reason: result.reasoning_summary,
    url: result.recommendation.url,
    is_premium: result.recommendation.is_premium,
    confidence: result.confidence,
    requested_duration_minutes: result.duration_if_present
      ? result.duration_if_present.value * (result.duration_if_present.unit === "hours" ? 60 : 1)
      : null,
    content_preference: result.content_preference_if_present,
    clarification_question: result.confidence < 0.6
      ? "Are you trying to calm down, fall asleep, or focus?"
      : null
  };
}
