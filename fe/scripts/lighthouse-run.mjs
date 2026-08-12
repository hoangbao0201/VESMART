#!/usr/bin/env node
/**
 * Mobile Lighthouse performance for home / PDP / blog.
 * Usage:
 *   BASE_URL=http://139.180.136.119 node scripts/lighthouse-run.mjs
 *   OUT_DIR=scripts/lh-latest node scripts/lighthouse-run.mjs
 *
 * Requires Chrome/Edge. Installs lighthouse via npx if needed.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.BASE_URL || "http://139.180.136.119").replace(/\/$/, "");
const OUT_DIR = process.env.OUT_DIR || "scripts/lh-latest";
const CHROME =
  process.env.CHROME_PATH ||
  (existsSync("C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe")
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : existsSync("C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe")
      ? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
      : "");

const URLS = [
  { name: "home", url: `${BASE}/` },
  {
    name: "pdp",
    url: `${BASE}/products/bo-phu-kien-cho-robot-ecovacs-deebot-x8-pro-omni-17`,
  },
  { name: "blog", url: `${BASE}/blog/may-hut-am-khong-hoat-ong-58` },
];

mkdirSync(OUT_DIR, { recursive: true });

const summary = [`# Lighthouse mobile`, "", `Date: ${new Date().toISOString()}`, `Base: ${BASE}`, ""];

for (const item of URLS) {
  const outJson = join(OUT_DIR, `${item.name}.json`);
  console.log(`Lighthouse ${item.name} → ${item.url}`);
  const args = [
    "--yes",
    "lighthouse",
    item.url,
    "--only-categories=performance",
    "--form-factor=mobile",
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--output=json",
    `--output-path=${outJson}`,
    "--quiet",
  ];
  if (CHROME) args.splice(args.length - 1, 0, `--chrome-path=${CHROME}`);

  const result = spawnSync("npx", args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    summary.push(`- **${item.name}**: FAILED (exit ${result.status})`);
    continue;
  }
  const report = JSON.parse(readFileSync(outJson, "utf8"));
  const perf = Math.round((report.categories?.performance?.score ?? 0) * 100);
  const lcp = report.audits?.["largest-contentful-paint"]?.displayValue ?? "?";
  const cls = report.audits?.["cumulative-layout-shift"]?.displayValue ?? "?";
  const tbt = report.audits?.["total-blocking-time"]?.displayValue ?? "?";
  const line = `- **${item.name}**: Performance **${perf}** | LCP ${lcp} | CLS ${cls} | TBT ${tbt}`;
  console.log(line);
  summary.push(line);
}

const mdPath = join(OUT_DIR, "summary.md");
writeFileSync(mdPath, `${summary.join("\n")}\n`, "utf8");
console.log(`\nWrote ${mdPath}`);
