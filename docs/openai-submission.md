# OpenAI plugin preparation

Official requirements checked on 2026-09-30:

- https://developers.openai.com/plugins/build/mcp-server
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/deploy/submission
- https://developers.openai.com/plugins/deploy/app-review

## Architecture

Muse POST /recommendations and ChatGPT MCP /mcp both call the shared
recommendationFlow.js classifier and productionCatalog.js mapping. Platform
adapters shape results and supply attribution. Muse retains utm_source=muse;
ChatGPT uses utm_source=chatgpt. No extra primary categories or sessions exist.
The same paid Render service hosts both transports; no second host is needed.

Tool: recommend_session. Required input: user_context. Optional inputs:
desired_outcome (STRESS/SLEEP/FOCUS, only if explicitly stated), desired_duration
(positive minutes), content_preference. The tool is read-only, non-destructive,
idempotent, and operates on a fixed catalog. It requires no user authentication.
It returns selected session metadata, a concise reason, confidence, and a link.
It cannot play audio, purchase content, or diagnose or treat medical conditions.

MCP URL: https://infinite-state-muse.onrender.com/mcp
Portable manifest: plugins/infinite-state/plugin.json
Transport configuration: plugins/infinite-state/mcp.json
This is the current remote-MCP plugin format, not a legacy ai-plugin.json.

## Manual preparation still required

1. In https://platform.openai.com/settings/organization/general, select the
   organization and complete business verification to publish as Infinite State
   LLC (or individual verification to publish under your own verified name).
   Use an organization-owner account or have the owner grant Apps Management
   Write; draft access also requires Apps Management Read.
2. The supplied ISLogo Android.png is included as assets/logo.png (512x512),
   referenced by both logo and composerIcon. Review its appearance in the
   portal. Dark variants and screenshots are optional.
3. Verify that the website, support, privacy, and terms pages are publicly
   readable and identify Infinite State. The current privacy link was found in
   the website navigation but did not render readable content when checked
   earlier; it must be repaired or confirmed before public submission.
4. Choose the category from the dashboard and availability countries. The draft
   category Productivity is a documented category and should be confirmed for
   this listing. Countries are omitted until the publisher chooses availability.
5. In ChatGPT Settings > Security and login, enable Developer mode if available.
   At https://chatgpt.com/plugins, use the plus button to connect the production
   MCP URL without authentication. Run all five positive and three negative
   review prompts. SDK tests establish protocol behavior, not ChatGPT's tool
   selection or responses; record the actual ChatGPT results separately.
6. Record a reviewer-accessible video walkthrough demonstrating those cases.
   Add the actual URL to extensions.com.openai.review.demo_recording_url; do
   not substitute a placeholder video or claim an unrun ChatGPT case passed.
7. Upload the plugin ZIP at https://platform.openai.com/plugins, choose the
   verified Developer identity, and inspect Metadata & Skills and MCPs.
8. When the portal generates the domain challenge, copy its exact token into
   Render's OPENAI_APPS_CHALLENGE environment variable. Our server returns only
   that token at /.well-known/openai-apps-challenge; without a token it returns
   404. Click Verify Domain, connect MCP, and resolve the tool scan findings.
9. Complete Review details and the required policy attestations, then submit.
   No reviewer login is needed for this unauthenticated tool. Publish only
   after OpenAI approves the plugin.

The package is a draft until readable policies, ChatGPT tests, video,
publisher verification, and domain verification are complete. Do not interpret
a live MCP URL or passing SDK tests as directory approval.

Build the draft ZIP with npm run package:plugin. It contains plugin.json,
mcp.json, and the supplied logo. Rebuild after adding the real review video URL.
Run npm run verify:deployment -- https://infinite-state-muse.onrender.com to
check the deployed REST and MCP transports against the five positive cases.
