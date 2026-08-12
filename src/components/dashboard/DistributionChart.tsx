"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import pattern from "patternomaly";
import type { DistributionEntry } from "@/utils/distribution";
import { colorForIndex } from "@/utils/palette";
import { useImagePatterns } from "./useImagePatterns";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DistributionChartProps {
  title: string;
  data: DistributionEntry[];
  /**
   * Optional per-label color lookup (e.g. standard lithology colors).
   * Return null/undefined to fall through to the default alphabetical
   * palette color for that label.
   */
  colorFor?: (label: string) => string | null | undefined;
  /**
   * Optional per-label pattern shape (patternomaly shape name), drawn
   * over colorFor's color instead of a flat fill — e.g. dots for
   * sandstone, dashes for shale. Only used as a fallback for labels
   * that don't have a real symbol image (see imageFor).
   */
  patternFor?: (label: string) => string | null | undefined;
  /**
   * Optional per-label image path (e.g. a cropped tile from the real
   * reference legend) — takes priority over patternFor/colorFor when
   * the image has finished loading. Falls back to patternFor/colorFor
   * while loading or for labels with no matching image.
   */
  imageFor?: (label: string) => string | null | undefined;
  /** Optional small caption shown under the chart, e.g. explaining multi-count wells. */
  note?: string;
}

export default function DistributionChart({
  title,
  data,
  colorFor,
  patternFor,
  imageFor,
  note,
}: DistributionChartProps) {
  // Colored by the label's position in an ALPHABETICAL ordering (not
  // the chart's count-sorted order), so a given value always gets the
  // same fallback color here as it does on the map's colored markers.
  const sortedLabels = [...data].map((e) => e.label).sort((a, b) => a.localeCompare(b));

  const imagePaths = imageFor
    ? Array.from(new Set(data.map((d) => imageFor(d.label)).filter((p): p is string => !!p)))
    : [];
  const imagePatterns = useImagePatterns(imagePaths);

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
                  const imgPath = imageFor?.(d.label);
                  if (imgPath && imagePatterns[imgPath]) {
                    return imagePatterns[imgPath];
                  }

                  const color = colorFor?.(d.label) ?? colorForIndex(sortedLabels.indexOf(d.label));
                  const shape = patternFor?.(d.label);
                  // patternomaly's draw() touches `document` internally,
                  // which doesn't exist during server-side prerendering —
                  // only use it once we're actually running in the browser.
                  return shape && typeof document !== "undefined" ? pattern.draw(shape, color) : color;
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
      {note && <p className="text-xs text-white/30 mt-2">{note}</p>}
    </div>
  );
}
