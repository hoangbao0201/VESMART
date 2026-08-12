import { buildUrlSetXml, xmlResponse } from "@/lib/sitemap/build-sitemap-xml";
import { getTagSitemapEntries } from "@/lib/sitemap/queries";

export const revalidate = 3600;

export async function GET() {
  const entries = await getTagSitemapEntries();
  return xmlResponse(buildUrlSetXml(entries));
}
