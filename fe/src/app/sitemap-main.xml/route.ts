import { buildUrlSetXml, xmlResponse } from "@/lib/sitemap/build-sitemap-xml";
import { getMainSitemapEntries } from "@/lib/sitemap/queries";

export const revalidate = 3600;

export async function GET() {
  return xmlResponse(buildUrlSetXml(getMainSitemapEntries()));
}
