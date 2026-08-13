import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function formatStamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

/**
 * Write forum seed JSON to result/{postId}-{timestamp}.json
 * @returns {string} absolute-ish relative path written
 */
export function writeResult(resultDir, { postId, datapost, comments }) {
  mkdirSync(resultDir, { recursive: true });
  const safeId = String(postId || "unknown").replace(/[^\w-]/g, "");
  const filename = `${safeId}-${formatStamp()}.json`;
  const filepath = join(resultDir, filename);
  const payload = { datapost, comments };
  writeFileSync(filepath, JSON.stringify(payload, null, 2), "utf8");
  return filepath;
}
