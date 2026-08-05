/**
 * Parses coordinate strings as they actually appear in the sheet, e.g.
 * "33.345638° N", "44.551819°", "-44.55". Returns null instead of
 * throwing so one bad row never breaks the map or the build.
 */
export function parseCoordinate(value: string | undefined | null): number | null {
  if (!value) return null;

  const trimmed = value.trim();
  const match = trimmed.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([NSEW])?/i);
  if (!match) return null;

  const [, numStr, hemisphere] = match;
  let num = parseFloat(numStr);
  if (Number.isNaN(num)) return null;

  if (hemisphere && /[SW]/i.test(hemisphere)) {
    num = -Math.abs(num);
  }

  return num;
}
