import type { ComponentType } from "react";

interface SectionHeaderProps {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
}

export default function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-lg bg-brand-gold/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-brand-gold" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
    </div>
  );
}
