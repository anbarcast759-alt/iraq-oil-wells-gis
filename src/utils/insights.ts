import type { Well } from "@/types/well";
import { parseDepth } from "./depth";
import { computeDistribution } from "./distribution";
import { computeSpacingWarnings } from "./spacing";
import { detectHazards } from "./hazards";
import { missingCoreFields } from "./completeness";

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
 * Turns the dataset into readable analytical sentences instead of
 * leaving the reader to interpret raw numbers/charts themselves.
 * Degrades gracefully for small datasets — e.g. skips statistical
 * outlier detection below 3 wells, where a stddev isn't meaningful.
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
    const deepest = wells.find((w) => parseDepth(w.TD_Depth) === maxDepth);
    insights.push({
      text: `Average TD is ${avg.toFixed(0)}m; the deepest well is ${deepest?.Well_Name || deepest?.slug} at ${maxDepth.toFixed(0)}m.`,
      tone: "neutral",
    });

    // Outlier detection needs at least 3 points for a stddev that
    // means anything — with 1-2 wells everything is "average" by definition.
    if (depths.length >= 3) {
      const mean = avg;
      const variance = depths.reduce((s, d) => s + (d - mean) ** 2, 0) / depths.length;
      const stddev = Math.sqrt(variance);
      const outliers = wells.filter((w) => {
        const d = parseDepth(w.TD_Depth);
        return d !== null && stddev > 0 && Math.abs(d - mean) > 1.5 * stddev;
      });
      for (const w of outliers) {
        const d = parseDepth(w.TD_Depth)!;
        const direction = d > mean ? "deeper" : "shallower";
        insights.push({
          text: `${w.Well_Name || w.slug} is notably ${direction} than the field average (${d.toFixed(0)}m vs ${mean.toFixed(0)}m avg).`,
          tone: "neutral",
        });
      }
    }
  }

  const topFormation = topEntry(wells, "Productive_Formation");
  if (topFormation) {
    const pct = ((topFormation.count / wells.length) * 100).toFixed(0);
    insights.push({
      text: `${topFormation.count} of ${wells.length} wells (${pct}%) target the ${topFormation.label} formation.`,
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

  const spacingWarnings = computeSpacingWarnings(wells);
  if (spacingWarnings.length > 0) {
    insights.push({
      text: `${spacingWarnings.length} well pair${spacingWarnings.length === 1 ? "" : "s"} ${spacingWarnings.length === 1 ? "is" : "are"} drilled less than 500m apart — check for spacing conflicts.`,
      tone: "warning",
    });
  }

  return insights;
}
