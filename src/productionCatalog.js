import { createProductionCatalog } from "./sessionCatalog.js";

export const INFINITE_STATE_MVP_SESSION_CATALOG = createProductionCatalog({
  SLEEP: {
    title: "DRIFT OFF TO DEEP SLEEP w/ DELTA BINAURAL BEATS",
    url: "https://www.infinitestate.app/delta/i/78135297/sound-225",
    duration: "55:55 minutes",
    is_premium: false
  },
  FOCUS: {
    title: "INCREASE FOCUS w/ BETA BINAURAL BEATS",
    url: "https://www.infinitestate.app/beta/i/78134096/sound-213",
    duration: "22:22",
    is_premium: false
  },
  STRESS: {
    title: "REDUCE STRESS w/ ALPHA BINAURAL BEATS",
    url: "https://www.infinitestate.app/alpha/i/78135007/sound-217",
    duration: "11:11",
    is_premium: false
  }
});
