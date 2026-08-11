"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { DistributionEntry } from "@/utils/distribution";
import { colorForIndex } from "@/utils/palette";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionChartProps {
  title: string;
  data: DistributionEntry[];
}

export default function DistributionChart({ title, data }: DistributionChartProps) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-white/50 mb-4">{title}</p>
      {data.length === 0 ? (
        <p className="text-white/30 text-sm">No data yet</p>
      ) : (
        <Doughnut
          data={{
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.count),
                backgroundColor: data.map((d) => {
                  // Colored by the label's position in an ALPHABETICAL
                  // ordering (not the chart's count-sorted order), so
                  // a given value always gets the same color here as
                  // it does on the map's colored markers.
                  const sortedLabels = [...data]
                    .map((e) => e.label)
                    .sort((a, b) => a.localeCompare(b));
                  return colorForIndex(sortedLabels.indexOf(d.label));
                }),
                borderColor: "#0A1A2F",
                borderWidth: 2,
              },
            ],
          }}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "rgba(255,255,255,0.7)",
                  boxWidth: 12,
                  font: { size: 11 },
                },
              },
            },
          }}
        />
      )}
    </div>
  );
}
