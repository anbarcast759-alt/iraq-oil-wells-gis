"use client";

import { useState } from "react";
import type { Well } from "@/types/well";
import { drillingPeriod } from "@/utils/drillingDuration";

interface DrillingTimelineProps {
  wells: Well[];
}

const MONTH_FORMAT = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

export default function DrillingTimeline({ wells }: DrillingTimelineProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const rows = wells
    .map((w) => ({ well: w, period: drillingPeriod(w) }))
    .filter((r): r is { well: Well; period: NonNullable<ReturnType<typeof drillingPeriod>> } => r.period !== null)
    .sort((a, b) => a.period.spud.getTime() - b.period.spud.getTime());

  if (rows.length === 0) {
    return (
      <div className="glass-card p-5 mb-8 text-sm text-white/40">
        No wells have both Spud_Date and Completion_Date filled yet.
      </div>
    );
  }

  const rangeStart = Math.min(...rows.map((r) => r.period.spud.getTime()));
  const rangeEnd = Math.max(...rows.map((r) => r.period.completion.getTime()));
  const totalSpan = rangeEnd - rangeStart || 1;

  const tickCount = 6;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = rangeStart + (totalSpan * i) / (tickCount - 1);
    return { pct: (i / (tickCount - 1)) * 100, label: MONTH_FORMAT.format(new Date(t)) };
  });

  const selected = rows.find((r) => r.well.slug === selectedSlug) ?? null;

  return (
    <div className="glass-card p-5 mb-8">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/50">Drilling Timeline</p>
        <p className="text-xs text-white/30">
          {rows.length} wells, sorted by spud date — click a bar for details
        </p>
      </div>

      {selected && (
        <div className="flex items-center justify-between gap-3 mt-3 mb-1 glass-card bg-white/5 px-3 py-2 text-xs">
          <span className="font-medium text-brand-gold">
            {selected.well.Well_Name || selected.well.slug}
          </span>
          <span className="text-white/60">
            {DATE_FORMAT.format(selected.period.spud)} → {DATE_FORMAT.format(selected.period.completion)}
          </span>
          <span className="text-white/60">{selected.period.days.toFixed(0)} days</span>
          <button
            onClick={() => setSelectedSlug(null)}
            className="text-white/40 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      <div className="relative mt-4 mb-2 h-4 text-[10px] text-white/30">
        {ticks.map((t, i) => (
          <span key={i} className="absolute -translate-x-1/2" style={{ left: `${t.pct}%` }}>
            {t.label}
          </span>
        ))}
      </div>

      <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1.5">
        {rows.map(({ well, period }) => {
          const left = ((period.spud.getTime() - rangeStart) / totalSpan) * 100;
          const width = Math.max(
            0.4,
            ((period.completion.getTime() - period.spud.getTime()) / totalSpan) * 100
          );
          const isSelected = well.slug === selectedSlug;
          return (
            <div key={well.slug} className="flex items-center gap-3 text-xs">
              <span className="w-24 shrink-0 truncate text-white/60">
                {well.Well_Name || well.slug}
              </span>
              <div className="relative flex-1 h-3 bg-white/5 rounded">
                <button
                  onClick={() => setSelectedSlug(isSelected ? null : well.slug)}
                  className={`absolute h-3 rounded transition-all ${
                    isSelected ? "bg-brand-gold ring-2 ring-white/40" : "bg-brand-gold/80 hover:bg-brand-gold"
                  }`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  aria-label={`${well.Well_Name || well.slug}: ${period.days.toFixed(0)} days, ${DATE_FORMAT.format(period.spud)} to ${DATE_FORMAT.format(period.completion)}`}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-white/40">
                {period.days.toFixed(0)}d
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
