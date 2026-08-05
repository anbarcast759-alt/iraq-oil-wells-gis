import type { WellStats } from "@/utils/stats";

interface StatsGridProps {
  stats: WellStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <StatCard label="Total Wells" value={stats.total} />
      <StatCard label="Producing" value={stats.producing} />
      <StatCard label="Drilling" value={stats.drilling} />
      <StatCard label="Abandoned" value={stats.abandoned} />
      <StatCard
        label="Avg. Depth"
        value={stats.avgDepth !== null ? `${stats.avgDepth.toFixed(0)} m` : "—"}
      />
      <StatCard
        label="Deepest Well"
        value={stats.deepestWell ? `${stats.deepestWell.depth.toFixed(0)} m` : "—"}
        sub={stats.deepestWell?.name}
      />
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40 truncate">{sub}</p>}
    </div>
  );
}
