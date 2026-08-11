import type { Well } from "@/types/well";

/**
 * Keyword -> readable label. Matched case-insensitively against
 * Remarks. This is deliberately a real drilling/geology hazard
 * vocabulary (not generic "problem" words), so a match means something
 * specific to someone reading it.
 */
const HAZARD_KEYWORDS: { pattern: RegExp; label: string }[] = [
  { pattern: /h2s|hydrogen sulfide|sour gas/i, label: "H2S / Sour Gas" },
  { pattern: /\bfault\b|faulting/i, label: "Fault Risk" },
  { pattern: /gas kick|\bkick\b/i, label: "Gas Kick" },
  { pattern: /lost circulation|mud loss/i, label: "Lost Circulation" },
  { pattern: /blowout|bop\b/i, label: "Blowout Risk" },
  { pattern: /overpressure|abnormal pressure|high pressure/i, label: "Overpressure" },
  { pattern: /stuck pipe/i, label: "Stuck Pipe" },
  { pattern: /corrosion/i, label: "Corrosion" },
];

export function detectHazards(well: Well): string[] {
  const text = well.Remarks ?? "";
  if (!text.trim()) return [];
  const matches = HAZARD_KEYWORDS.filter((h) => h.pattern.test(text));
  return Array.from(new Set(matches.map((m) => m.label)));
}

export function hasHazard(well: Well): boolean {
  return detectHazards(well).length > 0;
}
