import type { MetadataRoute } from "next";
import { getWellsDataset } from "@/services/googleSheets";

// Change this to the real production domain before deploying.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.netlify.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
  ];

  try {
    const { wells } = await getWellsDataset();
    for (const well of wells) {
      entries.push({
        url: `${SITE_URL}/wells/${well.slug}`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  } catch {
    // If the sheet is unreachable at build time, still ship a valid
    // sitemap with just the home page rather than failing the build.
  }

  return entries;
}
