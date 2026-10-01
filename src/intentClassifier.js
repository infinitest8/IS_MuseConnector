import { PRIMARY_GOALS } from "./goals.js";

const OUTCOME_PATTERNS = [
  {
    goal: PRIMARY_GOALS.SLEEP,
    intent: "sleep_outcome",
    weight: 8,
    patterns: [
      /\b(can'?t|cannot|trouble|having trouble)\s+(fall(ing)?\s+)?sleep(ing)?\b/i,
      /\b(can'?t|cannot)\s+(get back to|stay)\s+sleep\b/i,
      /\b(help me|need to|want to|trying to)\s+(sleep|fall asleep|rest|nap|drift off)\b/i,
      /\b(get me sleepy|fall asleep fast|prepare for sleep|settle down for the night)\b/i,
      /\b(bedtime|before bed|at night|during the night|nighttime)\b/i,
      /\b(woke up|tossing and turning|power nap|take a nap)\b/i
    ]
  },
  {
    goal: PRIMARY_GOALS.FOCUS,
    intent: "focus_outcome",
    weight: 8,
    patterns: [
      /\b(need to|have to|want to|trying to|help me)\s+(focus|concentrate|study|work|finish|write|read|code|start|lock in)\b/i,
      /\b(get work done|be productive|stay on task|pay attention|block distractions|get in the zone|flow state)\b/i,
      /\b(deep work|work session|study(ing)?|exam prep|meeting prep|presentation prep|deadline|report)\b/i,
      /\b(focus|study|concentration|productivity)\s+(music|session)\b/i,
      /\b(stay awake|work for another|focus for)\b/i
    ]
  },
  {
    goal: PRIMARY_GOALS.STRESS,
    intent: "stress_outcome",
    weight: 8,
    patterns: [
      /\b(need to|want to|help me|trying to)\s+(calm down|relax|reset|regulate|decompress|settle|breathe|slow down)\b/i,
      /\b(need|want)\s+(grounding|a break|some peace|an emotional reset)\b/i,
      /\b(get centered|feel grounded|clear my head|calm me down|help me settle)\b/i,
      /\b(pre-meeting nerves|performance nerves|rough day|bad day)\b/i,
      /\b(anxious|stressed|nervous|overwhelmed|panicky).*\b(about|before).*\b(meeting|presentation|performance|call)\b/i
    ]
  }
];

const CONTEXT_PATTERNS = [
  {
    goal: PRIMARY_GOALS.SLEEP,
    intent: "sleep_context",
    weight: 4,
    patterns: [
      /\b(mind|brain)\s+won'?t\s+shut off\b/i,
      /\b(racing thoughts|overthinking).*\b(night|bed|sleep)\b/i,
      /\b(tired but wired|exhausted but awake|restless at night|late night stress)\b/i,
      /\b(sleep sounds|sleep music|sleep meditation|bedtime anxiety|nighttime anxiety)\b/i
    ]
  },
  {
    goal: PRIMARY_GOALS.FOCUS,
    intent: "focus_context",
    weight: 4,
    patterns: [
      /\b(can'?t concentrate|distracted|easily distracted|procrastinating|stop procrastinating)\b/i,
      /\b(brain fog|mentally foggy|can'?t get started|need motivation|need energy|mental fatigue)\b/i,
      /\b(writing|reading|coding|creative work|studying for a test|writing a paper|afternoon slump)\b/i,
      /\b(clear my head|need clarity|can'?t think).*\b(work|study|focus|meeting|presentation|report|deadline)\b/i
    ]
  },
  {
    goal: PRIMARY_GOALS.STRESS,
    intent: "stress_context",
    weight: 4,
    patterns: [
      /\b(stressed|overwhelmed|anxious|panicky|tense|wound up|on edge|frazzled|irritated|angry|frustrated)\b/i,
      /\b(emotionally drained|burnt out|burned out|mentally exhausted|overstimulated|uneasy|nervous|restless|agitated)\b/i,
      /\b(can'?t relax|too much going on|head is spinning|feeling pressure|under pressure|spiraling)\b/i,
      /\b(dysregulated|activated|triggered|stressed about)\b/i
    ]
  }
];

const NEXT_ACTION_PATTERNS = [
  {
    goal: PRIMARY_GOALS.SLEEP,
    intent: "sleep_next_action",
    weight: 5,
    patterns: [/\b(before bed|go to bed|fall asleep|take a nap|nap|sleep tonight)\b/i]
  },
  {
    goal: PRIMARY_GOALS.FOCUS,
    intent: "focus_next_action",
    weight: 5,
    patterns: [/\b(finish this|finish my|work for|study for|prep for|prepare for|write|code|read|meeting|presentation|deadline)\b/i]
  },
  {
    goal: PRIMARY_GOALS.STRESS,
    intent: "stress_next_action",
    weight: 5,
    patterns: [/\b(before my|before a|stressed about).*\b(meeting|presentation|performance|call)\b/i]
  }
];

const CONTENT_PREFERENCES = [
  { label: "sleep sounds", pattern: /\bsleep sounds?\b/i },
  { label: "sleep music", pattern: /\bsleep music\b/i },
  { label: "focus music", pattern: /\bfocus music\b/i },
  { label: "study music", pattern: /\bstudy music\b/i },
  { label: "concentration music", pattern: /\bconcentration music\b/i },
  { label: "productivity music", pattern: /\bproductivity music\b/i },
  { label: "breathing", pattern: /\b(breathing|breathe)\b/i },
  { label: "meditation", pattern: /\bmeditation\b/i }
];

const TIME_CONTEXTS = [
  { label: "before bed", pattern: /\bbefore bed\b/i },
  { label: "bedtime", pattern: /\bbedtime\b/i },
  { label: "night", pattern: /\b(night|nighttime|late night)\b/i },
  { label: "woke during the night", pattern: /\bwoke up( during the night)?\b/i },
  { label: "early morning wakeup", pattern: /\bwoke up at\s+([234])\s*(a\.?m\.?|am)\b/i },
  { label: "afternoon", pattern: /\bafternoon\b/i },
  { label: "before meeting", pattern: /\bbefore (a|my|the)?\s*meeting\b/i },
  { label: "before presentation", pattern: /\bbefore (a|my|the)?\s*presentation\b/i }
];

const DURATION_PATTERN = /\b(\d+)\s*(minute|min|minutes|mins|hour|hours|hr|hrs)\b/i;

export function classifyIntent(input) {
  const text = normalizeInput(input);
  const scores = {
    [PRIMARY_GOALS.STRESS]: 0,
    [PRIMARY_GOALS.SLEEP]: 0,
    [PRIMARY_GOALS.FOCUS]: 0
  };
  const detectedIntents = [];

  scorePatternGroup(text, OUTCOME_PATTERNS, scores, detectedIntents);
  scorePatternGroup(text, NEXT_ACTION_PATTERNS, scores, detectedIntents);
  scorePatternGroup(text, CONTEXT_PATTERNS, scores, detectedIntents);
  applyAmbiguityRules(text, scores, detectedIntents);

  const rankedGoals = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [primaryGoal, topScore] = rankedGoals[0];
  const runnerUpScore = rankedGoals[1][1];
  const fallbackGoal = topScore === 0 ? PRIMARY_GOALS.STRESS : primaryGoal;
  const confidence = confidenceFor(topScore, runnerUpScore);

  return {
    primary_goal: fallbackGoal,
    confidence,
    reasoning_summary: reasoningSummary(fallbackGoal, text),
    detected_intents: detectedIntents,
    duration_if_present: extractDuration(text),
    time_context_if_present: extractFirstMatch(text, TIME_CONTEXTS),
    content_preference_if_present: extractFirstMatch(text, CONTENT_PREFERENCES)
  };
}

function normalizeInput(input) {
  return String(input ?? "").trim().replace(/\s+/g, " ");
}

function scorePatternGroup(text, groups, scores, detectedIntents) {
  for (const group of groups) {
    for (const pattern of group.patterns) {
      if (pattern.test(text)) {
        scores[group.goal] += group.weight;
        detectedIntents.push(group.intent);
        break;
      }
    }
  }
}

function applyAmbiguityRules(text, scores, detectedIntents) {
  if (/\b(racing thoughts|mind is racing|mind'?s racing)\b/i.test(text)) {
    if (/\b(sleep|bed|night|asleep)\b/i.test(text)) {
      scores[PRIMARY_GOALS.SLEEP] += 5;
      detectedIntents.push("ambiguous_racing_thoughts_sleep_context");
    } else if (/\b(finish|work|study|report|deadline|meeting|presentation)\b/i.test(text)) {
      scores[PRIMARY_GOALS.FOCUS] += 5;
      detectedIntents.push("ambiguous_racing_thoughts_work_context");
    } else {
      scores[PRIMARY_GOALS.STRESS] += 2;
      detectedIntents.push("ambiguous_racing_thoughts_regulation_context");
    }
  }

  if (/\b(mentally exhausted|tired|restless|need a reset|need clarity|can'?t think|get centered)\b/i.test(text)) {
    if (/\b(nap|sleep|bed|rest|drift off)\b/i.test(text)) {
      scores[PRIMARY_GOALS.SLEEP] += 4;
      detectedIntents.push("ambiguous_fatigue_sleep_context");
    } else if (/\b(work|study|focus|meeting|presentation|deadline|finish|hour)\b/i.test(text)) {
      scores[PRIMARY_GOALS.FOCUS] += 4;
      detectedIntents.push("ambiguous_fatigue_focus_context");
    } else if (/\b(unwind|decompress|calm|relax|ground|reset)\b/i.test(text)) {
      scores[PRIMARY_GOALS.STRESS] += 4;
      detectedIntents.push("ambiguous_fatigue_regulation_context");
    }
  }
}

function confidenceFor(topScore, runnerUpScore) {
  if (topScore === 0) return 0.3;
  const margin = topScore - runnerUpScore;
  if (topScore >= 12 && margin >= 5) return 0.9;
  if (topScore >= 8 && margin >= 4) return 0.8;
  if (margin >= 3) return 0.68;
  return 0.52;
}

function reasoningSummary(goal, text) {
  if (goal === PRIMARY_GOALS.SLEEP) {
    if (/\bnap\b/i.test(text)) return "User wants help resting or taking a nap.";
    return "User is trying to fall asleep or wind down for rest.";
  }

  if (goal === PRIMARY_GOALS.FOCUS) {
    if (/\b(study|studying|exam|test)\b/i.test(text)) return "User wants sustained concentration for studying.";
    if (/\b(meeting|presentation)\b/i.test(text)) return "User wants mental clarity for upcoming work.";
    return "User wants help concentrating and staying productive.";
  }

  if (/\b(meeting|presentation|performance)\b/i.test(text)) {
    return "User wants help calming down before a high-pressure moment.";
  }
  return "User wants help calming down, regulating, or decompressing.";
}

function extractDuration(text) {
  const match = text.match(DURATION_PATTERN);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase().startsWith("hour") || match[2].toLowerCase().startsWith("hr") ? "hours" : "minutes";
  return { value, unit };
}

function extractFirstMatch(text, candidates) {
  const match = candidates.find((candidate) => candidate.pattern.test(text));
  return match ? match.label : null;
}
