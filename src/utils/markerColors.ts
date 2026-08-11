import type { Well } from "@/types/well";
import { colorForIndex } from "./palette";

export type ColorableField =
  | "Well_Type"
  | "Lithology"
  | "Productive_Formation"
  | "Reservoir"
  | "Rig";

export const COLORABLE_FIELDS: { field: ColorableField; label: string }[] = [
  { field: "Well_Type", label: "Well Type" },
  { field: "Lithology", label: "Lithology" },
  { field: "Productive_Formation", label: "Formation" },
  { field: "Reservoir", label: "Reservoir" },
  { field: "Rig", label: "Rig" },
];

export const UNSPECIFIED_COLOR = "#8A93A6";

/**
 * Colors are assigned by SORTED value order, not sheet row order, so
 * the same value always gets the same color across re-fetches even
 * as rows are added/reordered/filtered.
 */
export function buildColorMap(
  wells: Well[],
  field: ColorableField
): Map<string, string> {
  const values = Array.from(
    new Set(
      wells
        .map((w) => w[field])
        .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    )
  ).sort((a, b) => a.localeCompare(b));

  const map = new Map<string, string>();
  values.forEach((v, i) => map.set(v, colorForIndex(i)));
  return map;
}

export function colorForWell(
  well: Well,
  field: ColorableField | null,
  colorMap: Map<string, string>
): string {
  if (!field) return "#C9A24B"; // default gold, matches the original pin
  const value = well[field];
  if (typeof value === "string" && value.trim() && colorMap.has(value)) {
    return colorMap.get(value)!;
  }
  return UNSPECIFIED_COLOR;
}
