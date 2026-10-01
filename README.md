# Muse Connector - Infinite State Meditations

Recommendation requests normalize to exactly one top-level goal:

- `STRESS`
- `SLEEP`
- `FOCUS`

Production session selection is intentionally gated. The live MVP uses exactly one confirmed meditation per goal, and no production URL is generated or substituted by this code.

## Final MVP Sessions

Confirmed by Tyler on 2026-09-30:

### STRESS
- `REDUCE STRESS w/ ALPHA BINAURAL BEATS`
- `https://www.infinitestate.app/alpha/i/78135007/sound-217`
- `11:11`
- free

### SLEEP
- `DRIFT OFF TO DEEP SLEEP w/ DELTA BINAURAL BEATS`
- `https://www.infinitestate.app/delta/i/78135297/sound-225`
- `55:55 minutes`
- free

### FOCUS
- `INCREASE FOCUS w/ BETA BINAURAL BEATS`
- `https://www.infinitestate.app/beta/i/78134096/sound-213`
- `22:22`
- free

Use `INFINITE_STATE_MVP_SESSION_CATALOG` for production recommendations. The development catalog remains available for isolated tests and local fixture flows.

## Test

```sh
npm test
```

## Muse Onboarding

Target: https://muse.ai/platform. Submission currently asks for a work-email sign-in before revealing the connector form. Muse-specific transport and authentication requirements have not yet been verified.

The local REST API uses the confirmed MVP catalog by default:

```sh
npm start
```

POST `http://127.0.0.1:3000/recommendations` with JSON:

```json
{"text":"My mind is racing and I need to sleep."}
```

GET `/health` checks availability. GET `/openapi.json` serves the API description, also saved in `openapi.json`. Set `PORT` as needed; set `HOST=0.0.0.0` when deploying behind a hosting provider's HTTPS proxy. No production host or deployment URL has been chosen.

The API does not store requests or log their content. It is unauthenticated; configure authentication and traffic limits to match Muse's onboarding requirements before public deployment. Its classifier uses heuristic rules, so local tests do not establish general natural-language accuracy. Requested duration does not change the selected session's fixed duration.

Suggested submission description:

> Infinite State recommends one free meditation for stress relief, sleep, or focus based on the user's desired outcome, then provides a direct link to the selected session.

Remaining steps: sign in to Muse onboarding, confirm its integration requirements, choose hosting, deploy over HTTPS, and test inside Muse. The existing UTM parameters are analytics attribution, not a verified Muse referral contract. Browser playback and live Muse integration remain unverified.

## Render Deployment

Muse's technical form offers Raw API, an API URL, optional OpenAPI URL,
documentation URL, access requirements, and optional authentication methods.

`render.yaml` configures a free Node web service for initial testing. Push this
project to a Git repository connected to Render, then create a Blueprint from
that repository. The free service may sleep when idle. No paid service is
configured. The deployment URL must be taken from Render after deployment.

Use the deployed base URL for Muse's API URL, `/openapi.json` for its OpenAPI
specification, and `/docs` for documentation. POST requests go to
`/recommendations`. The web service uses only the three confirmed sessions.
