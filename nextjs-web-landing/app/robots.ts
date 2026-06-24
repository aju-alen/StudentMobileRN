import type { MetadataRoute } from "next";
import { CANONICAL_SITE_ORIGIN, canonicalUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: canonicalUrl("sitemap.xml"),
    host: CANONICAL_SITE_ORIGIN,
  };
}
