import type { Well } from "@/types/well";

/**
 * Columns we offer as dropdown filters. Kept as a list (not "all
 * columns") because things like Remarks or Spud_Date aren't sensible
 * dropdown filters — but every value inside these columns still comes
 * straight from the sheet, nothing hardcoded.
 */
export const FILTERABLE_FIELDS = [
  "Field",
  "Productive_Formation",
  "Reservoir",
  "Governorate",
  "Operator",
  "Rig",
  "Well_Type",
  "Lithology",
] as const;

export type FilterableField = (typeof FILTERABLE_FIELDS)[number];

export function getFilterOptions(
  wells: Well[]
): Record<FilterableField, string[]> {
  const options = {} as Record<FilterableField, string[]>;

  for (const field of FILTERABLE_FIELDS) {
    const values = new Set<string>();
    for (const well of wells) {
      const value = well[field];
      if (value && value.trim()) values.add(value.trim());
    }
    options[field] = Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  return options;
}
