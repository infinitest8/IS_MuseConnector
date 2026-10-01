import assert from "node:assert/strict";
import { test } from "node:test";
import { createRecommendationServer } from "../src/server.js";

test("HTTP recommendations route all three goals to approved sessions", async () => {
  const server = createRecommendationServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [text, goal, path] of [
      ["Help me calm down", "STRESS", "/alpha/i/78135007/sound-217"],
      ["I need to sleep", "SLEEP", "/delta/i/78135297/sound-225"],
      ["I need to focus for 20 minutes", "FOCUS", "/beta/i/78134096/sound-213"]
    ]) {
      const response = await fetch(`${base}/recommendations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text })
      });
      assert.equal(response.status, 200);
      const result = await response.json();
      assert.equal(result.primary_goal, goal);
      assert.equal(new URL(result.recommendation.url).pathname, path);
      assert.equal(new URL(result.recommendation.url).searchParams.get("utm_source"), "muse");
      assert.equal(result.recommendation.is_premium, false);
    }
    for (const body of ["{", "null", '{}', '{"text":42}', '{"text":" "}']) {
      const response = await fetch(`${base}/recommendations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body
      });
      assert.equal(response.status, 400);
    }
    assert.equal((await fetch(`${base}/recommendations`)).status, 405);
    const document = await (await fetch(`${base}/openapi.json`)).json();
    assert.equal(document.paths["/recommendations"].post.operationId, "recommendMeditation");
    const documentation = await fetch(`${base}/docs`);
    assert.equal(documentation.status, 200);
    assert.match(await documentation.text(), /POST \/recommendations/);
    assert.equal((await (await fetch(base)).json()).openapi, "/openapi.json");
  } finally {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
