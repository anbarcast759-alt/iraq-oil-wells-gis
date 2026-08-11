import type { MetadataRoute } from "next";

// The site is unlisted by request: reachable by anyone with the direct
// URL, but never indexed or surfaced by search engines. Blocking every
// path (not just /admin, /api) is what makes that true — allowing "/"
// would still let crawlers index and surface the public pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
