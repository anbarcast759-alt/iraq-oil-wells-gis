/**
 * Converts UTM (Easting/Northing) to decimal WGS84 lat/lon.
 *
 * WHY THIS EXISTS: the sheet's Surface_X/Surface_Y columns hold
 * projected UTM coordinates (e.g. "E: 458465.28m", "N: 3686880.60m"),
 * not decimal degrees — different from Latitude/Longitude. Iraq's oil
 * fields fall in UTM zone 38N (central meridian 45°E), which is the
 * default here. If a well ever falls outside that zone, override via
 * NEXT_PUBLIC_UTM_ZONE — but for the East Baghdad South field this
 * covers everything.
 *
 * Standard Snyder (1987) transverse Mercator inverse formulas,
 * accurate to well under a meter — far tighter than we need for
 * placing a map marker.
 */

const WGS84_A = 6378137.0; // semi-major axis (m)
const WGS84_F = 1 / 298.257223563; // flattening
const K0 = 0.9996; // UTM scale factor

export function utmToLatLon(
  easting: number,
  northing: number,
  zone = 38,
  hemisphere: "N" | "S" = "N"
): { lat: number; lng: number } {
  const e2 = WGS84_F * (2 - WGS84_F);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const e2prime = e2 / (1 - e2);

  const x = easting - 500000;
  const y = hemisphere === "S" ? northing - 10000000 : northing;

  const m = y / K0;
  const mu =
    m /
    (WGS84_A * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));

  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const n1 = WGS84_A / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const t1 = Math.tan(phi1) ** 2;
  const c1 = e2prime * Math.cos(phi1) ** 2;
  const r1 =
    (WGS84_A * (1 - e2)) / Math.pow(1 - e2 * Math.sin(phi1) ** 2, 1.5);
  const d = x / (n1 * K0);

  const lat =
    phi1 -
    ((n1 * Math.tan(phi1)) / r1) *
      ((d ** 2) / 2 -
        ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * e2prime) * d ** 4) / 24 +
        ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * e2prime - 3 * c1 ** 2) *
          d ** 6) /
          720);

  const lon0 = ((zone - 1) * 6 - 180 + 3) * (Math.PI / 180);
  const lon =
    lon0 +
    (d -
      ((1 + 2 * t1 + c1) * d ** 3) / 6 +
      ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * e2prime + 24 * t1 ** 2) *
        d ** 5) /
        120) /
      Math.cos(phi1);

  return {
    lat: lat * (180 / Math.PI),
    lng: lon * (180 / Math.PI),
  };
}

/** Extracts the first number from strings like "E: 458465.28m". */
export function parseUtmValue(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return Number.isNaN(num) ? null : num;
}
