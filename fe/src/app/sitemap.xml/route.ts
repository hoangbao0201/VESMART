import {
  buildSitemapIndexXml,
  xmlResponse,
} from "@/lib/sitemap/build-sitemap-xml";

export const revalidate = 3600;

export async function GET() {
  const now = new Date();
  const xml = buildSitemapIndexXml([
    { loc: "/sitemap-main.xml", lastmod: now },
    { loc: "/sitemap-products.xml", lastmod: now },
    { loc: "/sitemap-posts.xml", lastmod: now },
    { loc: "/sitemap-tags.xml", lastmod: now },
    { loc: "/sitemap-forums.xml", lastmod: now },
  ]);
  return xmlResponse(xml);
}
