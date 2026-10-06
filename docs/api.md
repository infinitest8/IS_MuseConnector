# Infinite State Meditation Recommendation API

## Recommend a meditation

POST /recommendations
Content-Type: application/json

Request:
{"text":"My mind is racing and I need to sleep."}

Send the full user request, including the desired outcome and next activity.
The text field must contain 1 to 4000 characters, excluding whitespace-only
requests. The request body is limited to 16384 bytes.

The JSON response includes primary_goal (STRESS, SLEEP, or FOCUS), confidence,
reasoning_summary, detected_intents, duration_if_present, time_context_if_present,
content_preference_if_present, and recommendation.

recommendation contains goal, title, description, url, duration, is_premium, and source.
Its URL opens the user-approved Infinite State session with these parameters:
utm_source=muse, utm_medium=connector, utm_campaign=infinite_state_meditations.

## Access requirements

No authentication, subscription, or purchase is required by this API.
All three MVP recommendations link to free sessions. The API does not process
payments, link accounts, stream audio, or store request text.
The user opens the returned URL to listen on Infinite State.

STRESS: REDUCE STRESS w/ ALPHA BINAURAL BEATS, 11:11.
SLEEP: DRIFT OFF TO DEEP SLEEP w/ DELTA BINAURAL BEATS, 55:55.
FOCUS: INCREASE FOCUS w/ BETA BINAURAL BEATS, 22:22.

Requested duration does not alter these fixed session lengths. Confidence is
heuristic, not a calibrated probability. Low confidence indicates an ambiguous
request; ask "Are you trying to calm down, fall asleep, or focus?" when useful.

## Errors

400: Invalid JSON, missing text, or invalid text.
404: Unknown route.
405: Recommendations require POST.
413: Request body too large.
415: Content-Type must be application/json.
500: Unable to recommend a meditation.

GET /health returns {"status":"ok"}.
GET /openapi.json returns the OpenAPI 3.0.3 specification.

## ChatGPT MCP

Connect to https://infinite-state-muse.onrender.com/mcp with Streamable HTTP.
Tool: recommend_session. Required input: user_context (1-1000 characters).
Send only a brief immediate goal and relevant next activity, not conversation
history, memories, medical records, or unrelated personal information.
Optional: desired_outcome (STRESS/SLEEP/FOCUS, explicitly stated by the user),
desired_duration (positive minutes, at most 1440), content_preference (1-200
characters). Outputs include primary_goal, title, description, duration, reason,
url, is_premium, confidence, requested_duration_minutes, content_preference,
and clarification_question. No authentication is required.

Both transports use the same classifier and the same three selected sessions.
ChatGPT links use utm_source=chatgpt and utm_medium=plugin with the same campaign.
These are analytics parameters, not a verified platform referral contract.

## Claude MCP

Connect to https://infinite-state-muse.onrender.com/mcp/claude with Streamable HTTP.
The tool, inputs, outputs, and selected sessions are identical to ChatGPT's.
No sign-in, API key, or Infinite State account is required.
Claude links use utm_source=claude and utm_medium=connector with the same campaign.
The API processes request content transiently and does not log request bodies.
Render dashboard service logs are retained for seven days on the current Hobby
workspace; separate provider-held metadata follows Render's policies.
Support: hello@infinitestateapp.com.

## Hosting

Both endpoints use the existing paid Render web service (0.5 CPU, 512 MB).
It does not use free-tier idle sleeping. Deployments, outages, network latency,
and platform tool selection can still affect response time. API/MCP tests are
not a substitute for actual Muse or ChatGPT integration tests and approval.
