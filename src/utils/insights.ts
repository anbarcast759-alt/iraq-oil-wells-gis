import type { Well } from "@/types/well";
import { parseDepth } from "./depth";
import { computeDistribution, computeMultiDistribution } from "./distribution";
import { wellFormations } from "./multiFormation";
import { detectHazards } from "./hazards";
import { missingCoreFields } from "./completeness";
import { drillingDays } from "./drillingDuration";

export interface Insight {
  text: string;
  tone: "neutral" | "warning";
}

function topEntry(wells: Well[], field: keyof Well) {
  const dist = computeDistribution(wells, field);
  const top = dist.find((d) => d.label !== "Unspecified");
  return top ?? null;
}

/**
 * Turns the dataset into a short, fixed set of readable analytical
 * sentences (summary, depth range, dominant formation/lithology/rig,
 * and rollup counts for hazards/incomplete records/spacing) instead of
 * a per-well flood that grows with the dataset size.
 */
export function generateInsights(wells: Well[]): Insight[] {
  const insights: Insight[] = [];
  if (wells.length === 0) {
    return [{ text: "No wells in the dataset yet.", tone: "neutral" }];
  }

  const fields = new Set(wells.map((w) => w.Field).filter(Boolean));
  insights.push({
    text: `This dataset covers ${wells.length} well${wells.length === 1 ? "" : "s"} across ${fields.size || 1} field${fields.size === 1 ? "" : "s"}.`,
    tone: "neutral",
  });

  const depths = wells
    .map((w) => parseDepth(w.TD_Depth))
    .filter((d): d is number => d !== null);
  if (depths.length > 0) {
    const avg = depths.reduce((s, d) => s + d, 0) / depths.length;
    const maxDepth = Math.max(...depths);
    const minDepth = Math.min(...depths);
    const deepest = wells.find((w) => parseDepth(w.TD_Depth) === maxDepth);
    const shallowest = wells.find((w) => parseDepth(w.TD_Depth) === minDepth);
    insights.push({
      text: `Average TD is ${avg.toFixed(0)}m, ranging from ${minDepth.toFixed(0)}m (${shallowest?.Well_Name || shallowest?.slug}) to ${maxDepth.toFixed(0)}m (${deepest?.Well_Name || deepest?.slug}).`,
      tone: "neutral",
    });
  }

  const formationDist = computeMultiDistribution(wells, wellFormations).filter(
    (d) => d.label !== "Unspecified"
  );
  const topFormation = formationDist[0] ?? null;
  if (topFormation) {
    insights.push({
      text: `${topFormation.label} is the most-produced formation, appearing in ${topFormation.count} well${topFormation.count === 1 ? "" : "s"} (including laterals producing from more than one formation).`,
      tone: "neutral",
    });
  }

  const topLithology = topEntry(wells, "Lithology");
  if (topLithology && topLithology.count > 1) {
    insights.push({
      text: `${topLithology.label} is the most common lithology, seen in ${topLithology.count} wells.`,
      tone: "neutral",
    });
  }

  const topRig = topEntry(wells, "Rig");
  if (topRig && topRig.count > 1) {
    insights.push({
      text: `Rig ${topRig.label} has drilled ${topRig.count} of the wells in this dataset.`,
      tone: "neutral",
    });
  }

  const durations = wells
    .map((w) => ({ well: w, days: drillingDays(w) }))
    .filter((d): d is { well: Well; days: number } => d.days !== null);
  if (durations.length > 0) {
    const avgDays = durations.reduce((s, d) => s + d.days, 0) / durations.length;
    const fastest = durations.reduce((min, d) => (d.days < min.days ? d : min));
    insights.push({
      text: `Average drilling time is ${avgDays.toFixed(0)} days; the fastest well was ${fastest.well.Well_Name || fastest.well.slug} at ${fastest.days.toFixed(0)} days.`,
      tone: "neutral",
    });
  }

  const hazardCount = wells.filter((w) => detectHazards(w).length > 0).length;
  if (hazardCount > 0) {
    insights.push({
      text: `${hazardCount} well${hazardCount === 1 ? "" : "s"} have flagged hazards in their remarks (H2S, fault risk, etc.) — review before planning nearby work.`,
      tone: "warning",
    });
  }

  const incompleteCount = wells.filter((w) => missingCoreFields(w).length > 0).length;
  if (incompleteCount > 0) {
    insights.push({
      text: `${incompleteCount} well${incompleteCount === 1 ? "" : "s"} ${incompleteCount === 1 ? "is" : "are"} missing core data (name, field, depth, formation, or coordinates).`,
      tone: "warning",
    });
  }

  return insights;
}
