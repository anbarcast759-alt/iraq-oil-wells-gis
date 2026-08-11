import type { Well } from "@/types/well";
import { haversineKm } from "./geo";

export interface SpacingWarning {
  wellA: Well;
  wellB: Well;
  distanceMeters: number;
  /** Same well name and essentially the same location — likely a duplicate sheet entry, not a real spacing issue. */
  likelyDuplicate: boolean;
}

type LocatedWell = Well & { lat: number; lng: number };

/**
 * Flags any pair of wells closer than thresholdMeters (default 500m —
 * a common conservative spacing concern for development wells; adjust
 * per field/regulatory rules as needed). O(n²) is fine at hundreds of
 * wells; revisit with a spatial index if this ever covers thousands.
 *
 * Horizontal development pads intentionally cluster multiple wells at
 * the surface (they diverge underground), so a short surface distance
 * alone doesn't always mean a real problem — this stays a flag to
 * review, not a hard error. A same-name pair under 5m apart is called
 * out separately as a likely duplicate sheet row rather than a true
 * spacing concern.
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
        const likelyDuplicate =
          distanceMeters < 5 &&
          (located[i].Well_Name || located[i].slug) === (located[j].Well_Name || located[j].slug);
        warnings.push({ wellA: located[i], wellB: located[j], distanceMeters, likelyDuplicate });
      }
    }
  }
  return warnings.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

/** Wells near a given well, closest first — for a per-well "Nearby Wells" card. */
export function findNearbyWells(
  target: Well,
  wells: Well[],
  thresholdMeters = 500
): { well: Well; distanceMeters: number }[] {
  if (target.lat === null || target.lng === null) return [];
  const targetLoc = { lat: target.lat, lng: target.lng };

  return wells
    .filter((w): w is LocatedWell => w.lat !== null && w.lng !== null && w.slug !== target.slug)
    .map((w) => ({ well: w, distanceMeters: haversineKm(targetLoc, w) * 1000 }))
    .filter((n) => n.distanceMeters < thresholdMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
