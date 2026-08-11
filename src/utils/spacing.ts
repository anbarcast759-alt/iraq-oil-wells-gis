import type { Well } from "@/types/well";
import { haversineKm } from "./geo";

export interface SpacingWarning {
  wellA: Well;
  wellB: Well;
  distanceMeters: number;
}

type LocatedWell = Well & { lat: number; lng: number };

/**
 * Flags any pair of wells closer than thresholdMeters (default 500m —
 * a common conservative spacing concern for development wells; adjust
 * per field/regulatory rules as needed). O(n²) is fine at hundreds of
 * wells; revisit with a spatial index if this ever covers thousands.
 */
export function computeSpacingWarnings(
  wells: Well[],
  thresholdMeters = 500
): SpacingWarning[] {
  const located = wells.filter(
    (w): w is LocatedWell => w.lat !== null && w.lng !== null
  );

  const warnings: SpacingWarning[] = [];
  for (let i = 0; i < located.length; i++) {
    for (let j = i + 1; j < located.length; j++) {
      const distanceMeters = haversineKm(located[i], located[j]) * 1000;
      if (distanceMeters < thresholdMeters) {
        warnings.push({ wellA: located[i], wellB: located[j], distanceMeters });
      }
    }
  }
  return warnings.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
