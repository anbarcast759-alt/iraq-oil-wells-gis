import type { Well } from "@/types/well";

/**
 * Lateral/horizontal wells can produce from more than one formation
 * in a single wellbore, entered as a delimited list (e.g. "Hartha,
 * Khasib, Zubair" or "Hartha/Khasib/Zubair"). Splitting on common
 * separators lets the well count toward EACH formation it actually
 * produces from, instead of being lumped into one odd combined
 * category on charts/filters.
 */
export function parseFormations(value: string | undefined | null): string[] {
  if (!value || !value.trim()) return [];
  return value
    .split(/[,/&]| and /i)
    .map((f) => f.trim())
    .filter(Boolean);
}

export function wellFormations(well: Well): string[] {
  return parseFormations(well.Productive_Formation);
}

export function isMultiFormation(well: Well): boolean {
  return wellFormations(well).length > 1;
}
