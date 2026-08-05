import DistributionChart from "./DistributionChart";
import { computeDistribution } from "@/utils/distribution";
import type { Well } from "@/types/well";

interface DistributionChartsProps {
  wells: Well[];
}

export default function DistributionCharts({ wells }: DistributionChartsProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <DistributionChart
        title="Formation Distribution"
        data={computeDistribution(wells, "Productive_Formation")}
      />
      <DistributionChart
        title="Field Distribution"
        data={computeDistribution(wells, "Field")}
      />
      <DistributionChart
        title="Rig Distribution"
        data={computeDistribution(wells, "Rig")}
      />
    </section>
  );
}
