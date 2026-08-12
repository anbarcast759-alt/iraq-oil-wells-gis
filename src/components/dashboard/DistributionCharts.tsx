"use client";

import DistributionChart from "./DistributionChart";
import { computeDistribution, computeMultiDistribution } from "@/utils/distribution";
import { wellFormations } from "@/utils/multiFormation";
import { lithologyColor, lithologyPattern, lithologyImagePath } from "@/utils/lithologyColors";
import type { Well } from "@/types/well";

interface DistributionChartsProps {
  wells: Well[];
}

export default function DistributionCharts({ wells }: DistributionChartsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div id="formation-chart" className="scroll-mt-24">
        <DistributionChart
          title="Formation Distribution"
          data={computeMultiDistribution(wells, wellFormations)}
          note="Lateral wells producing from multiple formations count toward each one."
        />
      </div>
      <div id="lithology-chart" className="scroll-mt-24">
        <DistributionChart
          title="Lithology Distribution"
          data={computeDistribution(wells, "Lithology")}
          colorFor={lithologyColor}
          patternFor={lithologyPattern}
          imageFor={lithologyImagePath}
        />
      </div>
      <div id="rig-chart" className="scroll-mt-24">
        <DistributionChart
          title="Rig Distribution"
          data={computeDistribution(wells, "Rig")}
        />
      </div>
    </section>
  );
}
