import { mkdir, readFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = new URL("../plugins/infinite-state/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("plugin.json", root), "utf8"));
const metadata = manifest.extensions["com.openai"];
for (const path of [metadata.interface.logo, metadata.interface.composerIcon]) {
  const asset = await stat(new URL(path, root));
  if (asset.size > 5 * 1024 * 1024) throw new Error("Icon exceeds 5 MiB");
}
if (metadata.review.test_cases.positive.length !== 5 || metadata.review.test_cases.negative.length !== 3) {
  throw new Error("Submission requires five positive and three negative cases");
}
await mkdir(new URL("../dist/", import.meta.url), { recursive: true });
const archive = fileURLToPath(new URL("../dist/infinite-state-openai-plugin.zip", import.meta.url));
execFileSync("zip", ["-r", archive, "plugin.json", "mcp.json", "assets"], { cwd: fileURLToPath(root) });
console.log(`Draft plugin ZIP: ${archive}`);
console.log("Not submission-ready until the manual requirements in docs/openai-submission.md are complete.");
