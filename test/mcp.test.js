import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createRecommendationServer } from "../src/server.js";
import { recommendForMuse, recommendForChatGPT } from "../src/platformAdapters.js";

test("Muse and ChatGPT share session selection with separate attribution", () => {
  for (const user_context of ["Help me calm down", "Help me sleep", "I need to focus"]) {
    const muse = recommendForMuse(user_context);
    const chatgpt = recommendForChatGPT({ user_context });
    assert.equal(chatgpt.primary_goal, muse.primary_goal);
    assert.equal(chatgpt.title, muse.recommendation.title);
    assert.equal(new URL(chatgpt.url).pathname, new URL(muse.recommendation.url).pathname);
    assert.equal(new URL(muse.recommendation.url).searchParams.get("utm_source"), "muse");
    assert.equal(new URL(chatgpt.url).searchParams.get("utm_source"), "chatgpt");
  }
});

test("explicit desired outcome overrides fatigue and work context", () => {
  const result = recommendForChatGPT({
    user_context: "I am tired and have a report due tonight",
    desired_outcome: "SLEEP", desired_duration: 10, content_preference: "breathing"
  });
  assert.equal(result.primary_goal, "SLEEP");
  assert.equal(result.duration, "55:55 minutes");
  assert.equal(result.requested_duration_minutes, 10);
  assert.equal(result.content_preference, "breathing");
  assert.equal(recommendForChatGPT({ user_context: "focus for 2 hours" }).requested_duration_minutes, 120);
  assert.equal(recommendForChatGPT({ user_context: "meditation" }).clarification_question,
    "Are you trying to calm down, fall asleep, or focus?");
});

test("MCP SDK client initializes, discovers and calls the recommendation tool", async () => {
  const server = createRecommendationServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const client = new Client({ name: "infinite-state-review-tests", version: "1.0.0" });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`${base}/mcp`)));
    const { tools } = await client.listTools();
    assert.equal(tools.length, 1);
    assert.equal(tools[0].name, "recommend_session");
    assert.equal(tools[0].annotations.readOnlyHint, true);
    assert.equal(tools[0].annotations.openWorldHint, false);
    for (const [user_context, goal] of [
      ["I am overwhelmed and have ten minutes before a meeting.", "STRESS"],
      ["I have been lying here for an hour and cannot sleep.", "SLEEP"],
      ["I need to finish this report and cannot concentrate.", "FOCUS"]
    ]) {
      const result = await client.callTool({ name: "recommend_session", arguments: { user_context } });
      assert.equal(result.isError, undefined);
      assert.equal(result.structuredContent.primary_goal, goal);
      assert.equal(result.structuredContent.is_premium, false);
      assert.ok(result.structuredContent.description);
      assert.deepEqual(JSON.parse(result.content[0].text), result.structuredContent);
    }
    for (const args of [{ user_context: " " }, { user_context: "sleep", desired_outcome: "ENERGY" },
      { user_context: "focus", desired_duration: -1 }]) {
      const result = await client.callTool({ name: "recommend_session", arguments: args });
      assert.equal(result.isError, true);
    }
    assert.equal((await fetch(`${base}/.well-known/openai-apps-challenge`)).status, 404);
  } finally {
    await client.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
