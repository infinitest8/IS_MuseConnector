export const PRIMARY_GOALS = Object.freeze({
  STRESS: "STRESS",
  SLEEP: "SLEEP",
  FOCUS: "FOCUS"
});

export const PRIMARY_GOAL_VALUES = Object.freeze(Object.values(PRIMARY_GOALS));

export function assertPrimaryGoal(goal) {
  if (!PRIMARY_GOAL_VALUES.includes(goal)) {
    throw new Error(`Unsupported primary goal: ${goal}`);
  }
}
