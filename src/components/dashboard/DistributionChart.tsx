"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { DistributionEntry } from "@/utils/distribution";

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  "#C9A24B",
  "#3B5B84",
  "#E4C878",
  "#6B8CAE",
  "#9CB6CE",
  "#4A6FA5",
  "#D9C589",
  "#7C93AD",
];

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
                backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
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
