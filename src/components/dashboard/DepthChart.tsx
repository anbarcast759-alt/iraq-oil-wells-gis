"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import type { Well } from "@/types/well";
import { parseDepth } from "@/utils/depth";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface DepthChartProps {
  wells: Well[];
}

export default function DepthChart({ wells }: DepthChartProps) {
  const entries = wells
    .map((w) => ({ name: w.Well_Name || w.slug, depth: parseDepth(w.TD_Depth) }))
    .filter((e): e is { name: string; depth: number } => e.depth !== null)
    .sort((a, b) => b.depth - a.depth);

  return (
    <div className="glass-card p-5 mb-8">
      <p className="text-sm text-white/50 mb-4">Well Depth (TD, m)</p>
      {entries.length === 0 ? (
        <p className="text-white/30 text-sm">No depth data yet</p>
      ) : (
        <div style={{ height: Math.max(160, entries.length * 32) }}>
          <Bar
            data={{
              labels: entries.map((e) => e.name),
              datasets: [
                {
                  data: entries.map((e) => e.depth),
                  backgroundColor: "#C9A24B",
                  borderRadius: 4,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: {
                  ticks: { color: "rgba(255,255,255,0.5)" },
                  grid: { color: "rgba(255,255,255,0.08)" },
                },
                y: {
                  ticks: { color: "rgba(255,255,255,0.7)", font: { size: 11 } },
                  grid: { display: false },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
