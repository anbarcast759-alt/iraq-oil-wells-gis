import type { Well } from "@/types/well";

export interface DistributionEntry {
  label: string;
  count: number;
}

/**
 * Groups wells by a field's value and counts them, sorted largest
 * first. Blank cells are grouped under "Unspecified" instead of being
 * dropped, so the chart total always matches the well count.
 */
export function computeDistribution(
  wells: Well[],
  field: keyof Well
): DistributionEntry[] {
  const counts = new Map<string, number>();

  for (const well of wells) {
    const raw = well[field];
    const label = typeof raw === "string" && raw.trim() ? raw.trim() : "Unspecified";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
