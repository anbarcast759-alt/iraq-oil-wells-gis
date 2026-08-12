import type { Well } from "@/types/well";
import { parseSheetDate } from "./sheetDate";

export interface DrillingPeriod {
  spud: Date;
  completion: Date;
  days: number;
}

/** Returns the well's drilling period, or null if either date is missing/unparseable. */
export function drillingPeriod(well: Well): DrillingPeriod | null {
  const spud = parseSheetDate(well.Spud_Date);
  const completion = parseSheetDate(well.Completion_Date);
  if (!spud || !completion) return null;

  const days = (completion.getTime() - spud.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return null; // malformed data — completion before spud

  return { spud, completion, days };
}

export function drillingDays(well: Well): number | null {
  return drillingPeriod(well)?.days ?? null;
}
