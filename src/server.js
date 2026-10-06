import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { recommendForMuse } from "./platformAdapters.js";
import { handleMcpRequest } from "./mcpServer.js";

const MAX_BODY_BYTES = 16_384;

function send(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

export function createRecommendationServer() {
  return createServer(async (request, response) => {
    try {
      const path = new URL(request.url, "http://localhost").pathname;
      const isMcp = path === "/mcp" || path === "/mcp/claude";
      const platform = path === "/mcp/claude" ? "claude" : "chatgpt";
      if (path === "/.well-known/openai-apps-challenge" && request.method === "GET") {
        const token = process.env.OPENAI_APPS_CHALLENGE;
        if (!token) return send(response, 404, { error: "Verification token not configured" });
        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
        return response.end(token);
      }
      if (isMcp && request.method !== "POST") {
        return await handleMcpRequest(request, response, undefined, platform);
      }
      if (path === "/health" && request.method === "GET") {
        return send(response, 200, { status: "ok" });
      }
      if (path === "/docs" && request.method === "GET") {
        const documentation = await readFile(new URL("../docs/api.md", import.meta.url), "utf8");
        response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        return response.end(documentation);
      }
      if (path === "/" && request.method === "GET") {
        return send(response, 200, {
          service: "Infinite State Meditation Recommendations",
          documentation: "/docs",
          openapi: "/openapi.json"
        });
      }
      if (path === "/openapi.json" && request.method === "GET") {
        const document = JSON.parse(await readFile(new URL("../openapi.json", import.meta.url), "utf8"));
        return send(response, 200, document);
      }
      if (path !== "/recommendations" && !isMcp) return send(response, 404, { error: "Not found" });
      if (request.method !== "POST") {
        response.setHeader("Allow", "POST");
        return send(response, 405, { error: "Use POST for recommendations" });
      }
      if (request.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
        return send(response, 415, { error: "Use application/json" });
      }
      const chunks = [];
      let size = 0;
      for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) return send(response, 413, { error: "Request body too large" });
        chunks.push(chunk);
      }
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      } catch {
        return send(response, 400, { error: "Invalid JSON" });
      }
      if (isMcp) return await handleMcpRequest(request, response, body, platform);
      if (!body || typeof body.text !== "string" || !body.text.trim() || body.text.length > 4000) {
        return send(response, 400, { error: "text must be a nonempty string of at most 4000 characters" });
      }
      return send(response, 200, recommendForMuse(body.text));
    } catch {
      if (!response.headersSent) send(response, 500, { error: "Unable to recommend a meditation" });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  const host = process.env.HOST ?? "127.0.0.1";
  createRecommendationServer().listen(port, host, () => {
    console.log(`Infinite State recommendation API listening on http://${host}:${port}`);
  });
}
