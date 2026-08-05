import type { Well } from "@/types/well";
import type { FilterState } from "@/components/explore/FilterBar";
import { parseDepth } from "./depth";

const SEARCHABLE_FIELDS: (keyof Well)[] = [
  "Well_Name",
  "Field",
  "Productive_Formation",
  "Reservoir",
  "Operator",
  "Rig",
];

export function matchesSearch(well: Well, query: string): boolean {
  if (!query.trim()) return true;
  const needle = query.trim().toLowerCase();
  return SEARCHABLE_FIELDS.some((field) => {
    const value = well[field];
    return typeof value === "string" && value.toLowerCase().includes(needle);
  });
}

export function matchesFilters(well: Well, filters: FilterState): boolean {
  for (const [field, expected] of Object.entries(filters.fields)) {
    if (!expected) continue;
    if (well[field as keyof Well] !== expected) return false;
  }

  const depth = parseDepth(well.TD_Depth);
  if (filters.depthMin) {
    const min = parseFloat(filters.depthMin);
    if (!Number.isNaN(min) && (depth === null || depth < min)) return false;
  }
  if (filters.depthMax) {
    const max = parseFloat(filters.depthMax);
    if (!Number.isNaN(max) && (depth === null || depth > max)) return false;
  }

  return true;
}

export function filterWells(wells: Well[], query: string, filters: FilterState): Well[] {
  return wells.filter((w) => matchesSearch(w, query) && matchesFilters(w, filters));
}
