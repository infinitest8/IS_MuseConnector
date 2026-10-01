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

recommendation contains goal, title, url, duration, is_premium, and source.
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

## Hosting

A Render Free instance can sleep after inactivity, delaying the next request.
This deployment is suitable for initial review/testing; live Muse availability
and authentication requirements must be confirmed during review.
