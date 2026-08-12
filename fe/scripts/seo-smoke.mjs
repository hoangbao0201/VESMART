#!/usr/bin/env node
/**
 * SEO smoke checks against a live origin.
 * Usage: BASE_URL=http://139.180.136.119 node scripts/seo-smoke.mjs
 */
const BASE = (process.env.BASE_URL || "http://139.180.136.119").replace(/\/$/, "");

const CHECKS = [
  "/robots.txt",
  "/sitemap.xml",
  "/sitemap-main.xml",
  "/sitemap-products.xml",
  "/sitemap-posts.xml",
  "/sitemap-tags.xml",
  "/sitemap-forums.xml",
  "/",
  "/products",
  "/blog",
];

async function fetchText(path) {
  const res = await fetch(`${BASE}${path}`, {
    redirect: "follow",
    headers: { "user-agent": "vesmart-seo-smoke/1.0" },
  });
  const text = await res.text();
  return { res, text };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const failures = [];
  console.log(`SEO smoke → ${BASE}`);

  for (const path of CHECKS) {
    try {
      const { res, text } = await fetchText(path);
      assert(res.status < 500, `${path} status ${res.status}`);
      assert(res.status !== 404, `${path} 404`);
      if (path.includes("sitemap") || path === "/robots.txt") {
        assert(text.length > 20, `${path} empty body`);
      }
      if (path === "/robots.txt") {
        assert(/Sitemap:/i.test(text), "robots missing Sitemap");
        assert(/Disallow:\s*\/admin\//i.test(text), "robots missing /admin/");
      }
      if (path === "/sitemap.xml") {
        assert(/sitemapindex|urlset/i.test(text), "sitemap index invalid");
        assert(/sitemap-products\.xml/.test(text), "sitemap index missing products");
      }
      console.log(`OK ${res.status} ${path}`);
    } catch (err) {
      failures.push(String(err.message || err));
      console.error(`FAIL ${path}: ${err.message || err}`);
    }
  }

  // Sample detail pages: pick first locs from sitemaps
  try {
    const productsXml = (await fetchText("/sitemap-products.xml")).text;
    const postsXml = (await fetchText("/sitemap-posts.xml")).text;
    const prodMatch = productsXml.match(/<loc>([^<]+\/products\/[^<]+)<\/loc>/);
    const postMatch = postsXml.match(/<loc>([^<]+\/blog\/[^<]+)<\/loc>/);

    for (const [label, match] of [
      ["product", prodMatch],
      ["post", postMatch],
    ]) {
      if (!match) {
        console.warn(`SKIP ${label}: no loc in sitemap`);
        continue;
      }
      const url = match[1].replace(/^https?:\/\/[^/]+/, BASE);
      const res = await fetch(url, { headers: { "user-agent": "vesmart-seo-smoke/1.0" } });
      const html = await res.text();
      assert(res.status === 200, `${label} status ${res.status}`);
      assert(/rel=["']canonical["']/i.test(html), `${label} missing canonical`);
      assert(/application\/ld\+json/i.test(html), `${label} missing ld+json`);
      console.log(`OK 200 ${label} detail ${url}`);
    }
  } catch (err) {
    failures.push(String(err.message || err));
    console.error(`FAIL detail: ${err.message || err}`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} failure(s)`);
    process.exit(1);
  }
  console.log("\nSEO smoke passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
