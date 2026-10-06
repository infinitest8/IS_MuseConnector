import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { recommendForChatGPT, recommendForClaude } from "./platformAdapters.js";

export function createSessionMcpServer(platform = "chatgpt") {
  const server = new McpServer({ name: "infinite-state", version: "0.2.0" }, {
    instructions: "Recommend only Infinite State's three selected free sessions. Send only a brief summary of the user's immediate meditation goal and relevant next activity. Never send conversation history, chat transcripts, memories, medical records, or unrelated personal information. Set desired_outcome only when explicitly stated by the user. Session durations are fixed; do not promise an exact requested length. Use concise reasons. No medical diagnosis, treatment, payments, or account actions."
  });
  server.registerTool("recommend_session", {
    title: "Recommend an Infinite State session",
    description: "Recommend one selected Infinite State meditation for calming down, sleep, or concentration, using only a brief statement of the user's immediate goal and relevant next activity. Do not send conversation history, transcripts, memories, medical records, or unrelated personal information. Returns the session's actual duration and a direct listening link. Does not play audio, change accounts, diagnose conditions, or process payments. Ask the returned clarification question when intent is unclear.",
    inputSchema: {
      user_context: z.string().trim().min(1).max(1000).describe("A brief, task-specific statement of the immediate meditation goal and relevant next activity. Exclude conversation history, transcripts, memories, medical records, and unrelated personal details."),
      desired_outcome: z.enum(["STRESS", "SLEEP", "FOCUS"]).optional().describe("Only supply when the user explicitly states this desired outcome; it takes precedence over context."),
      desired_duration: z.number().positive().max(1440).optional().describe("Requested minutes, if stated. Selected session lengths are fixed."),
      content_preference: z.string().trim().min(1).max(200).optional().describe("The user's stated preference, if any; the three available sessions use binaural beats.")
    },
    outputSchema: {
      primary_goal: z.enum(["STRESS", "SLEEP", "FOCUS"]),
      title: z.string(), description: z.string(), duration: z.string(), reason: z.string(),
      url: z.string().url(), is_premium: z.boolean(), confidence: z.number().min(0).max(1),
      requested_duration_minutes: z.number().nullable(), content_preference: z.string().nullable(),
      clarification_question: z.string().nullable()
    },
    annotations: { title: "Recommend an Infinite State session", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _meta: { securitySchemes: [{ type: "noauth" }] }
  }, async (input) => {
    const result = platform === "claude" ? recommendForClaude(input) : recommendForChatGPT(input);
    return { structuredContent: result, content: [{ type: "text", text: JSON.stringify(result) }] };
  });
  return server;
}

export async function handleMcpRequest(request, response, body, platform = "chatgpt") {
  const server = createSessionMcpServer(platform);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  response.on("close", () => { void server.close(); });
  await server.connect(transport);
  await transport.handleRequest(request, response, body);
}
