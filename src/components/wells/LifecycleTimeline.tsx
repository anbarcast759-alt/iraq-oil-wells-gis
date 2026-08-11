import { Check } from "lucide-react";
import { LIFECYCLE_STAGES, inferLifecycleStage, type LifecycleStage } from "@/utils/lifecycle";
import type { Well } from "@/types/well";

interface LifecycleTimelineProps {
  well: Well;
}

export default function LifecycleTimeline({ well }: LifecycleTimelineProps) {
  const current = inferLifecycleStage(well);
  const currentIndex = LIFECYCLE_STAGES.indexOf(current);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-white/50">Well Lifecycle</p>
        <p className="text-[10px] text-white/30">inferred from Spud/Completion dates</p>
      </div>
      <div className="flex items-center mt-3">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <StageDot stage={stage} done={done} active={active} />
              {i < LIFECYCLE_STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    done ? "bg-brand-gold" : "bg-white/10"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageDot({
  stage,
  done,
  active,
}: {
  stage: LifecycleStage;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
          done
            ? "bg-brand-gold text-brand-navy"
            : active
              ? "bg-brand-gold/20 border-2 border-brand-gold text-brand-gold"
              : "bg-white/10 text-white/30"
        }`}
      >
        {done ? <Check className="w-3.5 h-3.5" /> : ""}
      </div>
      <span className={`text-xs ${active ? "text-brand-gold" : "text-white/40"}`}>
        {stage}
      </span>
    </div>
  );
}
