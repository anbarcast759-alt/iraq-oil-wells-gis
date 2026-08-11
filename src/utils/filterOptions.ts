import type { Well } from "@/types/well";

/**
 * Columns we offer as dropdown filters. Kept as a list (not "all
 * columns") because things like Remarks or Spud_Date aren't sensible
 * dropdown filters — but every value inside these columns still comes
 * straight from the sheet, nothing hardcoded.
 *
 * "WellNo" is a special case: the sheet's "Well No." column isn't a
 * typed KnownWellFields property (the header has a space), so it's
 * read from well.raw instead of well[field] — see getFieldValue below.
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

export function getFilterOptions(
  wells: Well[]
): Record<FilterableField, string[]> {
  const options = {} as Record<FilterableField, string[]>;

  for (const field of FILTERABLE_FIELDS) {
    const values = new Set<string>();
    for (const well of wells) {
      const value = getFieldValue(well, field);
      if (value && value.trim()) values.add(value.trim());
    }
    options[field] = Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  return options;
}
