import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/account/",
          "/auth/",
          "/cart",
          "/blog/new",
          "/blog/edit/",
          "/search",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin.replace(/^https?:\/\//, ""),
  };
}
