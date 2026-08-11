import { X } from "lucide-react";
import type { Well } from "@/types/well";
import { humanizeColumn } from "@/utils/format";

interface ComparisonPanelProps {
  wells: Well[];
  onClose: () => void;
}

export default function ComparisonPanel({ wells, onClose }: ComparisonPanelProps) {
  if (wells.length < 2) return null;

  // Union of every column across both wells, so a field only one of
  // them has still shows (as "—" for the other) instead of vanishing.
  const columns = Array.from(
    new Set(wells.flatMap((w) => Object.keys(w.raw)))
  );

  return (
    <section className="glass-card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Comparing Wells</h2>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white flex items-center gap-1 text-sm"
        >
          <X className="w-4 h-4" />
          Close
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-white/10">
              <th className="py-2 pr-4 text-white/40 font-medium">Field</th>
              {wells.map((w) => (
                <th key={w.slug} className="py-2 pr-4 font-medium text-brand-gold">
                  {w.Well_Name || w.slug}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {columns.map((column) => {
              const values = wells.map((w) => w.raw[column] || "—");
              // Highlight rows where the two wells differ — that's
              // usually the whole point of comparing them.
              const differs = new Set(values).size > 1;
              return (
                <tr key={column} className={differs ? "bg-brand-gold/5" : undefined}>
                  <td className="py-2 pr-4 text-white/40 whitespace-nowrap">
                    {humanizeColumn(column)}
                  </td>
                  {values.map((v, i) => (
                    <td key={i} className="py-2 pr-4">
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
