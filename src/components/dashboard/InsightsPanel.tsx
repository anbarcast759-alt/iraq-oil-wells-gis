import { Sparkles, AlertTriangle } from "lucide-react";
import type { Well } from "@/types/well";
import { generateInsights } from "@/utils/insights";

interface InsightsPanelProps {
  wells: Well[];
}

export default function InsightsPanel({ wells }: InsightsPanelProps) {
  const insights = generateInsights(wells);

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-3 text-white/50">
        <Sparkles className="w-4 h-4 text-brand-gold" />
        <p className="text-sm">Auto-Generated Insights</p>
      </div>
      <ul className="space-y-2.5">
        {insights.map((insight, i) => (
          <li
            key={i}
            className={`text-sm flex items-start gap-2 ${
              insight.tone === "warning" ? "text-amber-300" : "text-white/80"
            }`}
          >
            {insight.tone === "warning" ? (
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            ) : (
              <span className="w-1 h-1 rounded-full bg-brand-gold mt-2 shrink-0" />
            )}
            {insight.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
