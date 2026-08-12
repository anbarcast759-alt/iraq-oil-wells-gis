import type { Well } from "@/types/well";
import { wellFormations } from "./multiFormation";

/**
 * Columns we offer as dropdown filters. Kept as a list (not "all
 * columns") because things like Remarks or Spud_Date aren't sensible
 * dropdown filters — but every value inside these columns still comes
 * straight from the sheet, nothing hardcoded.
 *
 * "WellNo" is a special case: the sheet's "Well No." column isn't a
 * typed KnownWellFields property (the header has a space), so it's
 * read from well.raw instead of well[field] — see getFieldValue below.
 *
 * "Productive_Formation" is also special: a lateral well can list
 * multiple formations in one cell, so filtering/options use the
 * parsed list (matchesFieldFilter/formationOptions) rather than exact
 * whole-cell equality.
 */
export const FILTERABLE_FIELDS = [
  "WellNo",
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

export function getFieldValue(well: Well, field: FilterableField): string | undefined {
  if (field === "WellNo") {
    return well.raw["Well No."] || well.raw["Well_No"] || undefined;
  }
  return well[field];
}

/** Whether `well` matches `expected` for a given filter field — handles the multi-formation case specially. */
export function matchesFieldFilter(well: Well, field: FilterableField, expected: string): boolean {
  if (field === "Productive_Formation") {
    return wellFormations(well).includes(expected);
  }
  return getFieldValue(well, field) === expected;
}

export function getFilterOptions(
  wells: Well[]
): Record<FilterableField, string[]> {
  const options = {} as Record<FilterableField, string[]>;

  for (const field of FILTERABLE_FIELDS) {
    const values = new Set<string>();
    for (const well of wells) {
      if (field === "Productive_Formation") {
        for (const formation of wellFormations(well)) values.add(formation);
        continue;
      }
      const value = getFieldValue(well, field);
      if (value && value.trim()) values.add(value.trim());
    }
    options[field] = Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  return options;
}
