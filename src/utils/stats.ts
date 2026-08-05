import type { Well } from "@/types/well";
import { parseDepth } from "./depth";

export interface WellStats {
  total: number;
  producing: number;
  drilling: number;
  abandoned: number;
  avgDepth: number | null;
  deepestWell: { name: string; depth: number } | null;
}

function statusMatches(status: string | undefined, keyword: string): boolean {
  return (status ?? "").toLowerCase().includes(keyword);
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
    producing: wells.filter((w) => statusMatches(w.Well_Status, "produc")).length,
    drilling: wells.filter((w) => statusMatches(w.Well_Status, "drill")).length,
    abandoned: wells.filter((w) => statusMatches(w.Well_Status, "abandon")).length,
    avgDepth,
    deepestWell,
  };
}
