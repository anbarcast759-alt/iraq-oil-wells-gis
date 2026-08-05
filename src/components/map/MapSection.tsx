"use client";

import dynamic from "next/dynamic";
import type { Well } from "@/types/well";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-white/40">
      Loading map…
    </div>
  ),
});

interface MapSectionProps {
  wells: Well[];
  /** Pixel height of the map card. Defaults to 480 for the full page map. */
  height?: number;
  /** Slugs to fly to and mark gold, e.g. wells the chat assistant just answered about. */
  highlightSlugs?: string[];
}

export default function MapSection({ wells, height = 480, highlightSlugs = [] }: MapSectionProps) {
  const locatedCount = wells.filter((w) => w.lat !== null && w.lng !== null).length;

  return (
    <div className="glass-card overflow-hidden" style={{ height }}>
      {locatedCount === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-white/40 text-center px-6">
          No wells with valid coordinates yet — check the Latitude/Longitude
          columns in the sheet.
        </div>
      ) : (
        <MapView wells={wells} highlightSlugs={highlightSlugs} />
      )}
    </div>
  );
}
