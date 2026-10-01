export function addReferralAttribution(url, attribution = {}) {
  if (!url) return null;

  const parsedUrl = new URL(url);
  const params = {
    utm_source: "muse",
    utm_medium: "connector",
    utm_campaign: "infinite_state_meditations",
    ...attribution
  };

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      parsedUrl.searchParams.set(key, String(value));
    }
  }

  return parsedUrl.toString();
}
