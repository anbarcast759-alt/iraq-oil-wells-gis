import { FileWarning } from "lucide-react";
import { missingCoreFields } from "@/utils/completeness";
import type { Well } from "@/types/well";

interface CompletenessBadgeProps {
  well: Well;
  /** "icon" for tight spaces (lists), "full" for a labeled banner (detail page). */
  variant?: "icon" | "full";
}

export default function CompletenessBadge({ well, variant = "icon" }: CompletenessBadgeProps) {
  const missing = missingCoreFields(well);
  if (missing.length === 0) return null;

  if (variant === "icon") {
    return (
      <FileWarning
        className="w-3.5 h-3.5 text-amber-400 shrink-0"
        aria-label={`Incomplete record — missing: ${missing.join(", ")}`}
      />
    );
  }

  return (
    <div className="glass-card p-4 mb-6 border-amber-400/30 bg-amber-500/5 flex items-center gap-2 text-amber-300">
      <FileWarning className="w-4 h-4 shrink-0" />
      <p className="text-sm font-medium">Incomplete record — missing: {missing.join(", ")}</p>
    </div>
  );
}
