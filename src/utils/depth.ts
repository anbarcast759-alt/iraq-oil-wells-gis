/**
 * Parses depth strings as they appear in the sheet, e.g. "4188.00m",
 * "2083.15mTVD", "3500 m". Returns null instead of throwing so a
 * missing/malformed cell never breaks stats or the build.
 */
export function parseDepth(value: string | undefined | null): number | null {
  if (!value) return null;
  const match = value.trim().match(/(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  return Number.isNaN(num) ? null : num;
}
