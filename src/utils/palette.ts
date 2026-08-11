/** Shared color palette used by both the distribution charts and the
 * map's "color by" markers, so a value gets the same color in both
 * places (e.g. "Khasib" is the same color on the chart and the map). */
export const PALETTE = [
  "#C9A24B", // gold
  "#3B5B84",
  "#8BC34A",
  "#E4C878",
  "#6B8CAE",
  "#E57373",
  "#9CB6CE",
  "#BA68C8",
  "#4A6FA5",
  "#4DB6AC",
  "#D9C589",
  "#7C93AD",
];

export function colorForIndex(i: number): string {
  return PALETTE[i % PALETTE.length];
}
