import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { recommendForMuse } from "../src/platformAdapters.js";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
const manifest = JSON.parse(await readFile(new URL("../plugins/infinite-state/plugin.json", import.meta.url), "utf8"));
const client = new Client({ name: "infinite-state-deployment-verification", version: "1.0.0" });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL("/mcp", base)));
  const { tools } = await client.listTools();
  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, "recommend_session");
  for (const { prompt } of manifest.extensions["com.openai"].review.test_cases.positive) {
    const expected = recommendForMuse(prompt);
    const started = performance.now();
    const response = await fetch(new URL("/recommendations", base), {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: prompt }), signal: AbortSignal.timeout(15000)
    });
    assert.equal(response.status, 200);
    const muse = await response.json();
    const restMs = Math.round(performance.now() - started);
    const mcpStarted = performance.now();
    const result = await client.callTool({ name: "recommend_session", arguments: { user_context: prompt } }, undefined, { timeout: 15000 });
    assert.ok(!result.isError);
    const chatgpt = result.structuredContent;
    assert.equal(muse.primary_goal, expected.primary_goal);
    assert.equal(chatgpt.primary_goal, expected.primary_goal);
    assert.equal(chatgpt.title, expected.recommendation.title);
    assert.equal(chatgpt.duration, expected.recommendation.duration);
    assert.equal(chatgpt.is_premium, false);
    assert.equal(muse.recommendation.url, expected.recommendation.url);
    assert.equal(new URL(chatgpt.url).pathname, new URL(expected.recommendation.url).pathname);
    assert.equal(new URL(chatgpt.url).searchParams.get("utm_source"), "chatgpt");
    console.log(`${expected.primary_goal}: REST ${restMs}ms, MCP ${Math.round(performance.now() - mcpStarted)}ms; approved session matched`);
  }
  const invalid = await client.callTool({ name: "recommend_session", arguments: { user_context: "sleep", desired_outcome: "ENERGY" } });
  assert.equal(invalid.isError, true);
  console.log("Five positive cases and invalid-goal rejection passed. Actual ChatGPT/Muse tests still required.");
} finally {
  await client.close();
}
