import { AlertTriangle } from "lucide-react";
import type { Well } from "@/types/well";
import { computeSpacingWarnings } from "@/utils/spacing";

interface SpacingAlertProps {
  wells: Well[];
}

export default function SpacingAlert({ wells }: SpacingAlertProps) {
  const warnings = computeSpacingWarnings(wells);
  if (warnings.length === 0) return null;

  const shown = warnings.slice(0, 5);
  const remaining = warnings.length - shown.length;

  return (
    <div className="glass-card p-5 mb-8 border-red-400/30 bg-red-500/5">
      <div className="flex items-center gap-2 text-red-300 font-medium mb-3">
        <AlertTriangle className="w-4 h-4" />
        Well Spacing Alert — {warnings.length} pair
        {warnings.length > 1 ? "s" : ""} closer than 500m
      </div>
      <ul className="space-y-1.5 text-sm text-white/70">
        {shown.map((w, i) => (
          <li key={i}>
            <span className="font-medium">{w.wellA.Well_Name || w.wellA.slug}</span>
            {" ↔ "}
            <span className="font-medium">{w.wellB.Well_Name || w.wellB.slug}</span>
            {": "}
            {w.likelyDuplicate ? (
              <span className="text-amber-300">likely duplicate sheet entry ({w.distanceMeters.toFixed(0)} m apart)</span>
            ) : (
              <span className="text-red-300">{w.distanceMeters.toFixed(0)} m apart</span>
            )}
          </li>
        ))}
      </ul>
      {remaining > 0 && (
        <p className="text-xs text-white/40 mt-2">+{remaining} more closer than 500m</p>
      )}
      <p className="text-xs text-white/30 mt-2">
        Surface distance only — horizontal wells are often clustered at
        the surface by design and diverge underground, so review rather
        than treat every pair as a problem.
      </p>
    </div>
  );
}
