import { buildUrlSetXml, xmlResponse } from "@/lib/sitemap/build-sitemap-xml";
import { getForumSitemapEntries } from "@/lib/sitemap/queries";

export const revalidate = 3600;

export async function GET() {
  const entries = await getForumSitemapEntries();
  return xmlResponse(buildUrlSetXml(entries));
}
