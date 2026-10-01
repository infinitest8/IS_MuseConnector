import { classifyIntent } from "./intentClassifier.js";
import { addReferralAttribution } from "./referral.js";
import { DEVELOPMENT_SESSION_CATALOG, getSessionForGoal } from "./sessionCatalog.js";
import { assertPrimaryGoal } from "./goals.js";

export function recommendMeditation(input, options = {}) {
  const request = typeof input === "string" ? { user_context: input } : input ?? {};
  const classification = classifyIntent(request.user_context);
  if (request.desired_outcome) {
    assertPrimaryGoal(request.desired_outcome);
    classification.primary_goal = request.desired_outcome;
    classification.confidence = 0.98;
    classification.reasoning_summary = {
      STRESS: "User explicitly wants help calming down.",
      SLEEP: "User explicitly wants help sleeping or resting.",
      FOCUS: "User explicitly wants help concentrating."
    }[request.desired_outcome];
    classification.detected_intents.push("explicit_desired_outcome");
  }
  if (request.desired_duration !== undefined) {
    if (!Number.isFinite(request.desired_duration) || request.desired_duration <= 0) {
      throw new Error("desired_duration must be positive minutes");
    }
    classification.duration_if_present = { value: request.desired_duration, unit: "minutes" };
  }
  if (request.content_preference) classification.content_preference_if_present = request.content_preference;
  const catalog = options.catalog ?? DEVELOPMENT_SESSION_CATALOG;
  const session = getSessionForGoal(catalog, classification.primary_goal);
  const attributedUrl = addReferralAttribution(session.url, options.attribution);

  return {
    ...classification,
    recommendation: {
      goal: classification.primary_goal,
      title: session.title,
      description: session.description ?? "An Infinite State session for the selected goal.",
      url: attributedUrl,
      duration: session.duration,
      is_premium: session.is_premium,
      source: session.source
    }
  };
}
