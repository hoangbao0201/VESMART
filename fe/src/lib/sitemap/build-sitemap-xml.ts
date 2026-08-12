import { absoluteUrl, getPublicSiteUrl } from "@/lib/seo";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function formatLastMod(d: Date): string {
  return d.toISOString();
}

export type SitemapUrlEntry = {
  path: string;
  lastmod?: Date;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export function buildUrlSetXml(entries: SitemapUrlEntry[]): string {
  const origin = getPublicSiteUrl();
  const urls = entries.map(({ path, lastmod, changefreq, priority }) => {
    const loc = path.startsWith("http")
      ? path
      : `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    const parts = [`    <url>`, `      <loc>${escapeXml(loc)}</loc>`];
    if (lastmod) parts.push(`      <lastmod>${formatLastMod(lastmod)}</lastmod>`);
    if (changefreq) parts.push(`      <changefreq>${changefreq}</changefreq>`);
    if (priority != null && priority >= 0 && priority <= 1) {
      parts.push(`      <priority>${priority.toFixed(1)}</priority>`);
    }
    parts.push(`    </url>`);
    return parts.join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

export type SitemapIndexRef = { loc: string; lastmod?: Date };

export function buildSitemapIndexXml(sitemaps: SitemapIndexRef[]): string {
  const items = sitemaps.map(({ loc, lastmod }) => {
    const fullLoc = loc.startsWith("http") ? loc : absoluteUrl(loc);
    const lines = [`    <sitemap>`, `      <loc>${escapeXml(fullLoc)}</loc>`];
    if (lastmod) lines.push(`      <lastmod>${formatLastMod(lastmod)}</lastmod>`);
    lines.push(`    </sitemap>`);
    return lines.join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items.join("\n")}
</sitemapindex>`;
}

export const SITEMAP_CACHE_HEADER =
  "public, s-maxage=3600, stale-while-revalidate=86400";

export function xmlResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": SITEMAP_CACHE_HEADER,
    },
  });
}
