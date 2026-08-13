import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Random display names from names.json.
 * Same Facebook author_id always maps to the same name within one run.
 */
export function createNameAssigner(namesPath = join(__dirname, "..", "names.json")) {
  const raw = JSON.parse(readFileSync(namesPath, "utf8"));
  const pool = Array.isArray(raw?.data) ? [...raw.data] : [];
  if (pool.length === 0) {
    throw new Error("names.json không có data[]");
  }

  // shuffle once
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  let cursor = 0;
  const byAuthorId = new Map();
  const used = new Set();

  function nextName() {
    // Prefer unused names while pool still has free ones
    for (let attempt = 0; attempt < pool.length; attempt++) {
      const name = pool[cursor % pool.length];
      cursor += 1;
      if (!used.has(name)) {
        used.add(name);
        return name;
      }
    }
    // Exhausted unique names — allow reuse with suffix
    const base = pool[cursor % pool.length];
    cursor += 1;
    const name = `${base} ${used.size + 1}`;
    used.add(name);
    return name;
  }

  function assign(authorId) {
    const key = authorId ? String(authorId) : `__anon_${cursor}`;
    if (byAuthorId.has(key)) return byAuthorId.get(key);
    const name = nextName();
    byAuthorId.set(key, name);
    return name;
  }

  return { assign };
}
