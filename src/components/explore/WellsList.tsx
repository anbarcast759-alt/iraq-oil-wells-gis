"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import type { Well } from "@/types/well";
import { hasHazard } from "@/utils/hazards";
import CompletenessBadge from "@/components/wells/CompletenessBadge";

interface WellsListProps {
  wells: Well[];
  compareSlugs?: string[];
  onToggleCompare?: (slug: string) => void;
}

export default function WellsList({
  wells,
  compareSlugs = [],
  onToggleCompare,
}: WellsListProps) {
  if (wells.length === 0) {
    return (
      <section className="glass-card p-5 text-center text-white/40">
        No wells match the current search/filters.
      </section>
    );
  }

  return (
    <section className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Wells ({wells.length})</h2>
        {onToggleCompare && (
          <p className="text-xs text-white/40">
            Select up to 2 to compare
          </p>
        )}
      </div>
      <ul className="divide-y divide-white/10 max-h-[520px] overflow-y-auto pr-1">
        {wells.map((well) => {
          const checked = compareSlugs.includes(well.slug);
          const disabled = !checked && compareSlugs.length >= 2;
          return (
            <li key={well.slug} className="py-3 flex items-center gap-3">
              {onToggleCompare && (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggleCompare(well.slug)}
                  className="w-4 h-4 accent-brand-gold shrink-0 disabled:opacity-30"
                  aria-label={`Select ${well.Well_Name || well.slug} for comparison`}
                />
              )}
              <div className="flex-1 flex justify-between gap-4">
                <div>
                  <Link
                    href={`/wells/${well.slug}`}
                    className="font-medium hover:text-brand-gold inline-flex items-center gap-1.5"
                  >
                    {well.Well_Name || "(unnamed)"}
                    {hasHazard(well) && (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" aria-label="Hazard flagged in remarks" />
                    )}
                    <CompletenessBadge well={well} />
                  </Link>
                  <p className="text-sm text-white/50">
                    {well.Field || "—"} · {well.Governorate || "—"}
                  </p>
                </div>
                <div className="text-right text-sm text-white/50">
                  <p>{well.TD_Depth || "—"}</p>
                  <p>{well.Rig || "—"}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
