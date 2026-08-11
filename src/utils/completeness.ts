import type { Well } from "@/types/well";

/** Fields a well record needs to be considered "complete" for basic use. */
const CORE_FIELDS: { key: keyof Well; label: string }[] = [
  { key: "Well_Name", label: "Well Name" },
  { key: "Field", label: "Field" },
  { key: "TD_Depth", label: "TD Depth" },
  { key: "Productive_Formation", label: "Productive Formation" },
];

export function missingCoreFields(well: Well): string[] {
  const missing = CORE_FIELDS.filter((f) => {
    const value = well[f.key];
    return !value || (typeof value === "string" && !value.trim());
  }).map((f) => f.label);

  if (well.lat === null || well.lng === null) {
    missing.push("Coordinates");
  }

  return missing;
}

export function isComplete(well: Well): boolean {
  return missingCoreFields(well).length === 0;
}
