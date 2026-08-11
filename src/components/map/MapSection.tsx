"use client";

import dynamic from "next/dynamic";
import type { Well } from "@/types/well";
import type { ColorableField } from "@/utils/markerColors";

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
  /** When set, non-highlighted markers are colored by this field's value. */
  colorBy?: ColorableField | null;
  colorMap?: Map<string, string>;
}

export default function MapSection({
  wells,
  height = 480,
  highlightSlugs = [],
  colorBy = null,
  colorMap,
}: MapSectionProps) {
  const locatedCount = wells.filter((w) => w.lat !== null && w.lng !== null).length;

  return (
    <div className="glass-card overflow-hidden" style={{ height }}>
      {locatedCount === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-white/40 text-center px-6">
          No wells with valid coordinates yet — check the Latitude/Longitude
          columns in the sheet.
        </div>
      ) : (
        <MapView
          wells={wells}
          highlightSlugs={highlightSlugs}
          colorBy={colorBy}
          colorMap={colorMap}
        />
      )}
    </div>
  );
}
