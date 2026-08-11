import type { Well } from "@/types/well";

export type LifecycleStage = "Planned" | "Drilling" | "Completed";

export const LIFECYCLE_STAGES: LifecycleStage[] = ["Planned", "Drilling", "Completed"];

/**
 * There is no explicit "current status" column in the sheet (it was
 * repurposed to Lithology), so stage is INFERRED from date presence:
 *   - Completion_Date filled  -> Completed
 *   - Spud_Date filled only   -> Drilling (spudded, not yet completed)
 *   - neither filled          -> Planned
 *
 * This is a heuristic, not a source of truth. If a real status column
 * (e.g. covering Producing/Workover/Abandoned) is added later, prefer
 * that over this inference.
 */
export function inferLifecycleStage(well: Well): LifecycleStage {
  if (well.Completion_Date && well.Completion_Date.trim()) return "Completed";
  if (well.Spud_Date && well.Spud_Date.trim()) return "Drilling";
  return "Planned";
}
