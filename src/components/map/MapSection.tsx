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
}

export default function MapSection({ wells }: MapSectionProps) {
  const locatedCount = wells.filter((w) => w.lat !== null && w.lng !== null).length;

  return (
    <div className="glass-card h-[480px] overflow-hidden">
      {locatedCount === 0 ? (
        <div className="h-full w-full flex items-center justify-center text-white/40 text-center px-6">
          No wells with valid coordinates yet — check the Latitude/Longitude
          columns in the sheet.
        </div>
      ) : (
        <MapView wells={wells} />
      )}
    </div>
  );
}
