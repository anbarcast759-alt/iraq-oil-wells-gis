import { Database, Ruler, ArrowDownToLine } from "lucide-react";
import type { ComponentType } from "react";
import type { WellStats } from "@/utils/stats";
import CountUp from "@/components/ui/CountUp";

interface StatsGridProps {
  stats: WellStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <StatCard icon={Database} label="Total Wells" value={String(stats.total)} />
      <StatCard
        icon={Ruler}
        label="Avg. Depth"
        value={stats.avgDepth !== null ? `${stats.avgDepth.toFixed(0)} m` : "—"}
      />
      <StatCard
        icon={ArrowDownToLine}
        label="Deepest Well"
        value={stats.deepestWell ? `${stats.deepestWell.depth.toFixed(0)} m` : "—"}
        sub={stats.deepestWell?.name}
      />
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass-card p-5 transition-all duration-200 hover:bg-white/[0.08] hover:border-brand-gold/30 hover:-translate-y-0.5">
      <div className="flex items-center gap-2 text-white/50">
        <Icon className="w-4 h-4" />
        <p className="text-sm">{label}</p>
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
        <CountUp value={value} />
      </p>
      {sub && <p className="mt-1 text-xs text-white/40 truncate">{sub}</p>}
    </div>
  );
}
