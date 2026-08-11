/**
 * Standard lithology symbol colors, matching the common industry
 * legend convention (shale=green, sandstone=yellow, limestone=cyan,
 * etc.) — not an arbitrary palette. Keys are lowercase for
 * case-insensitive lookup.
 *
 * NOTE: this only colors a Lithology value that matches a real rock
 * type name. If the sheet's Lithology column holds formation names
 * instead (e.g. "Khasib", "Zubair") rather than actual lithology
 * types (e.g. "Limestone", "Shale"), those values won't match this
 * table and fall back to the normal chart palette — this is ready for
 * real lithology data whenever the column is filled with rock types.
 */
export const LITHOLOGY_COLORS: Record<string, string> = {
  shale: "#2E7D32",
  claystone: "#9E9E9E",
  "silty claystone": "#B5B5A8",
  siltstone: "#BDB76B",
  sandstone: "#F5E663",
  marl: "#ABABAB",
  limestone: "#8FD3E8",
  "dol limestone": "#6FC3D6",
  "dolomitic limestone": "#6FC3D6",
  "sdy limestone": "#9FDCE8",
  "sandy limestone": "#9FDCE8",
  "arg limestone": "#7BC4D4",
  "argillaceous limestone": "#7BC4D4",
  "limy claystone": "#ACA89A",
  dolomite: "#AEC6E8",
  "limy dolomite": "#BFD6EE",
  anhydrite: "#E896D8",
  "marly limestone": "#8ECFDD",
  salt: "#FFFFFF",
  asphalt: "#1A1A1A",
  "limy sandstone": "#F0EBA0",
  "no sample": "#D9D9D9",
};

/**
 * Approximate pattern shapes (via the `patternomaly` library) echoing
 * each symbol's texture in the reference legend — dashes for shale/
 * claystone, dots for sandstone/siltstone, brick-like fills for
 * limestone/dolomite variants, triangles for anhydrite, cross-hatch
 * for salt, diagonal for asphalt. These are close approximations
 * built from patternomaly's available shapes, not pixel-identical
 * reproductions of the reference image.
 */
export const LITHOLOGY_PATTERNS: Record<string, string> = {
  shale: "dash",
  claystone: "dash",
  "silty claystone": "dot-dash",
  siltstone: "dot",
  sandstone: "dot",
  marl: "dash",
  limestone: "square",
  "dol limestone": "diagonal",
  "dolomitic limestone": "diagonal",
  "sdy limestone": "dot",
  "sandy limestone": "dot",
  "arg limestone": "zigzag",
  "argillaceous limestone": "zigzag",
  "limy claystone": "dash",
  dolomite: "square",
  "limy dolomite": "square",
  anhydrite: "triangle",
  "marly limestone": "zigzag",
  salt: "cross",
  asphalt: "diagonal-right-left",
  "limy sandstone": "dot",
  "no sample": "",
};

function matchKey(label: string): string | null {
  const direct = label.trim().toLowerCase();
  if (LITHOLOGY_COLORS[direct]) return direct;

  const parts = label
    .split(/[/,\-–&]| and /i)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  return parts.find((p) => LITHOLOGY_COLORS[p]) ?? null;
}

/**
 * The real reference legend, cropped into individual tile images
 * (public/lithology/<slug>.png) — one per rock type. When a Lithology
 * value matches a key here, the chart uses the actual symbol image
 * (tiled as a repeating pattern) instead of a color or a
 * patternomaly-generated approximation.
 */
const LITHOLOGY_IMAGE_SLUGS: Record<string, string> = {
  shale: "shale",
  claystone: "claystone",
  "silty claystone": "silty-claystone",
  siltstone: "siltstone",
  sandstone: "sandstone",
  marl: "marl",
  limestone: "limestone",
  "dol limestone": "dol-limestone",
  "dolomitic limestone": "dol-limestone",
  "sdy limestone": "sdy-limestone",
  "sandy limestone": "sdy-limestone",
  "arg limestone": "arg-limestone",
  "argillaceous limestone": "arg-limestone",
  "limy claystone": "limy-claystone",
  dolomite: "dolomite",
  "limy dolomite": "limy-dolomite",
  anhydrite: "anhydrite",
  "marly limestone": "marly-limestone",
  salt: "salt",
  asphalt: "asphalt",
  "limy sandstone": "limy-sandstone",
  "no sample": "no-sample",
};

export function lithologyImagePath(label: string): string | null {
  const key = matchKey(label);
  if (!key) return null;
  const slug = LITHOLOGY_IMAGE_SLUGS[key];
  return slug ? `/lithology/${slug}.png` : null;
}

export function lithologyColor(label: string): string | null {
  const key = matchKey(label);
  return key ? LITHOLOGY_COLORS[key] : null;
}

/** Pattern shape name (for patternomaly) matching this lithology label, or null if none/plain. */
export function lithologyPattern(label: string): string | null {
  const key = matchKey(label);
  if (!key) return null;
  return LITHOLOGY_PATTERNS[key] || null;
}
