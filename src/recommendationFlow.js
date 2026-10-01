import { classifyIntent } from "./intentClassifier.js";
import { addReferralAttribution } from "./referral.js";
import { DEVELOPMENT_SESSION_CATALOG, getSessionForGoal } from "./sessionCatalog.js";

export function recommendMeditation(input, options = {}) {
  const classification = classifyIntent(input);
  const catalog = options.catalog ?? DEVELOPMENT_SESSION_CATALOG;
  const session = getSessionForGoal(catalog, classification.primary_goal);
  const attributedUrl = addReferralAttribution(session.url, options.attribution);

  return {
    ...classification,
    recommendation: {
      goal: classification.primary_goal,
      title: session.title,
      url: attributedUrl,
      duration: session.duration,
      is_premium: session.is_premium,
      source: session.source
    }
  };
}
