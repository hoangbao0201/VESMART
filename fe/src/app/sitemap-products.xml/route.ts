import { buildUrlSetXml, xmlResponse } from "@/lib/sitemap/build-sitemap-xml";
import { getProductSitemapEntries } from "@/lib/sitemap/queries";

export const revalidate = 3600;

export async function GET() {
  const entries = await getProductSitemapEntries();
  return xmlResponse(buildUrlSetXml(entries));
}
