import type { Well } from "@/types/well";
import { parseDepth } from "./depth";
import { parseUtmValue } from "./utm";

export interface BottomHole {
  /** True vertical depth at TD, from the curve (not necessarily equal to the TVD column). */
  tvd: number;
  /** North/East offset from surface, in meters. */
  northOffset: number;
  eastOffset: number;
  /** Straight-line horizontal displacement from surface to bottom-hole, in meters. */
  horizontalDisplacement: number;
  lat: number;
  lng: number;
}

const toRad = (deg: number) => (deg * Math.PI) / 180;
const metersPerDegreeLat = 111320;

/**
 * Minimum Curvature Method between two survey stations. With only a
 * single terminal point available (no full multi-station log), we
 * treat the surface as station 1 (MD 0, Inclination 0°) and the given
 * reading as station 2 — the standard 2-station case of the same
 * method, not a different formula. This gives a smooth, physically
 * reasonable curve rather than assuming the whole TD−TVD difference
 * is horizontal (which is what the cross-section schematic still
 * does, since it has no azimuth to work with).
 */
function minimumCurvature(
  md: number,
  inc1Deg: number,
  az1Deg: number,
  inc2Deg: number,
  az2Deg: number
): { deltaTVD: number; deltaNorth: number; deltaEast: number } {
  const inc1 = toRad(inc1Deg);
  const inc2 = toRad(inc2Deg);
  const az1 = toRad(az1Deg);
  const az2 = toRad(az2Deg);

  const cosBeta =
    Math.cos(inc1) * Math.cos(inc2) +
    Math.sin(inc1) * Math.sin(inc2) * Math.cos(az2 - az1);
  const beta = Math.acos(Math.min(1, Math.max(-1, cosBeta)));

  // Ratio factor: 1 when there's no direction change (avoids 0/0).
  const rf = beta === 0 ? 1 : (2 / beta) * Math.tan(beta / 2);

  const deltaTVD = (md / 2) * (Math.cos(inc1) + Math.cos(inc2)) * rf;
  const deltaNorth =
    (md / 2) * (Math.sin(inc1) * Math.cos(az1) + Math.sin(inc2) * Math.cos(az2)) * rf;
  const deltaEast =
    (md / 2) * (Math.sin(inc1) * Math.sin(az1) + Math.sin(inc2) * Math.sin(az2)) * rf;

  return { deltaTVD, deltaNorth, deltaEast };
}

/**
 * Returns the computed bottom-hole location, or null if the well is
 * missing any of the inputs needed (surface coordinates, TD, or the
 * terminal Inclination/Azimuth reading).
 */
export function computeBottomHole(well: Well): BottomHole | null {
  if (well.lat === null || well.lng === null) return null;

  const md = parseDepth(well.TD_Depth);
  const inclination = parseUtmValue(well.Inclination_TD);
  const azimuth = parseUtmValue(well.Azimuth_TD);
  if (md === null || inclination === null || azimuth === null) return null;

  const { deltaTVD, deltaNorth, deltaEast } = minimumCurvature(
    md,
    0,
    azimuth, // az1 is irrelevant when inc1 = 0 (sin(0) = 0), reuse az2
    inclination,
    azimuth
  );

  const dLat = deltaNorth / metersPerDegreeLat;
  const dLng = deltaEast / (metersPerDegreeLat * Math.cos(toRad(well.lat)));

  return {
    tvd: deltaTVD,
    northOffset: deltaNorth,
    eastOffset: deltaEast,
    horizontalDisplacement: Math.sqrt(deltaNorth ** 2 + deltaEast ** 2),
    lat: well.lat + dLat,
    lng: well.lng + dLng,
  };
}
