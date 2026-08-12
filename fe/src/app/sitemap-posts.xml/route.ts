import { buildUrlSetXml, xmlResponse } from "@/lib/sitemap/build-sitemap-xml";
import { getPostSitemapEntries } from "@/lib/sitemap/queries";

export const revalidate = 3600;

export async function GET() {
  const entries = await getPostSitemapEntries();
  return xmlResponse(buildUrlSetXml(entries));
}
