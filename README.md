# Infinite State Recommendation Service

Muse REST and ChatGPT MCP share one classifier and session catalog. Platform
adapters change response shape and attribution, not recommendation logic.

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

Target: https://muse.ai/platform. The publisher submitted the Muse application.
Approval and actual in-Muse tests remain pending.

The local REST API uses the confirmed MVP catalog by default:

```sh
npm start
```

POST `http://127.0.0.1:3000/recommendations` with JSON:

```json
{"text":"My mind is racing and I need to sleep."}
```

GET `/health` checks availability. GET `/openapi.json` serves the API description, also saved in `openapi.json`. Set `PORT` as needed; set `HOST=0.0.0.0` when deploying behind a hosting provider's HTTPS proxy.

The API does not store requests or log their content. It is unauthenticated; configure authentication and traffic limits to match Muse's onboarding requirements before public deployment. Its classifier uses heuristic rules, so local tests do not establish general natural-language accuracy. Requested duration does not change the selected session's fixed duration.

Suggested submission description:

> Infinite State recommends one free meditation for stress relief, sleep, or focus based on the user's desired outcome, then provides a direct link to the selected session.

Remaining steps: test inside Muse when access is available. The UTM parameters are
analytics attribution, not a verified Muse referral contract. Browser playback
and live Muse integration remain unverified.

## Render Deployment

Muse's technical form offers Raw API, an API URL, optional OpenAPI URL,
documentation URL, access requirements, and optional authentication methods.

`render.yaml` matches the existing paid service: 0.5 CPU and 512 MB. It does not
use free-tier idle sleeping. Main-branch pushes auto-deploy to the existing
service; no second hosting service is needed for ChatGPT.

Use the deployed base URL for Muse's API URL, `/openapi.json` for its OpenAPI
specification, and `/docs` for documentation. POST requests go to
`/recommendations`. The web service uses only the three confirmed sessions.

Live deployment:

- API base: https://infinite-state-muse.onrender.com
- OpenAPI: https://infinite-state-muse.onrender.com/openapi.json
- Documentation: https://infinite-state-muse.onrender.com/docs
- Repository: https://github.com/infinitest8/IS_MuseConnector
- Render service: https://dashboard.render.com/web/srv-dausau8jo6nc73edbsog

The publisher upgraded this service to the paid plan on 2026-09-30. HTTPS checks
verified health, documentation, OpenAPI, and the three approved session mappings.
Outages, deployments, and platform processing can still affect response time.

## ChatGPT MCP

Production endpoint: https://infinite-state-muse.onrender.com/mcp

Streamable HTTP tool: `recommend_session`. Required input: `user_context`.
Optional inputs: `desired_outcome` (STRESS/SLEEP/FOCUS, explicitly stated),
`desired_duration` (minutes), `content_preference`. No OpenAI API key is needed:
this service does not call a model. Returned sessions are the same three listed
above, with ChatGPT attribution. No authentication, payments, or audio streaming.

```sh
npm run verify:deployment -- https://infinite-state-muse.onrender.com
npm run package:plugin
```

The draft ZIP includes the supplied brand icon. See docs/openai-submission.md
for publisher verification, policy checks, actual ChatGPT tests/video, domain
verification, and the current submission process. A live MCP endpoint and SDK
tests do not imply ChatGPT directory approval or successful in-platform testing.
