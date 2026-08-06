import type { Well } from "@/types/well";
import { parseDepth } from "./depth";

/**
 * Producing/Drilling/Abandoned counts were dropped: they used to read
 * status keywords out of Well_Status, but that column was repurposed
 * to hold Lithology data instead. If a status field is reintroduced
 * later under a different column name, add it back here.
 */
export interface WellStats {
  total: number;
  avgDepth: number | null;
  deepestWell: { name: string; depth: number } | null;
}

export function computeWellStats(wells: Well[]): WellStats {
  const depths = wells
    .map((w) => ({ name: w.Well_Name ?? w.slug, depth: parseDepth(w.TD_Depth) }))
    .filter((d): d is { name: string; depth: number } => d.depth !== null);

  const avgDepth =
    depths.length > 0
      ? depths.reduce((sum, d) => sum + d.depth, 0) / depths.length
      : null;

  const deepestWell = depths.reduce<{ name: string; depth: number } | null>(
    (deepest, d) => (!deepest || d.depth > deepest.depth ? d : deepest),
    null
  );

  return {
    total: wells.length,
    avgDepth,
    deepestWell,
  };
}
