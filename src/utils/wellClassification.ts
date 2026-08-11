import type { Well } from "@/types/well";
import { parseDepth } from "./depth";

/**
 * Real horizontal-well naming convention in this dataset: names ending
 * in "H" (e.g. "EBSK-2-2H"). Combined with a TD-TVD gap check as a
 * second signal, so a blank Well_Type column doesn't silently make
 * every horizontal well look vertical on the cross-section/trajectory
 * views. Explicit Well_Type values are always trusted first.
 */
export function isEffectivelyHorizontal(well: Well): boolean {
  if (well.Well_Type && /horizontal|lateral/i.test(well.Well_Type)) return true;
  if (well.Well_Type && /^vertical$/i.test(well.Well_Type.trim())) return false;

  const name = well.Well_Name ?? "";
  if (/H$/i.test(name.trim())) return true;

  const td = parseDepth(well.TD_Depth);
  const tvd = parseDepth(well.TVD);
  if (td !== null && tvd !== null && td - tvd > 300) return true;

  return false;
}
