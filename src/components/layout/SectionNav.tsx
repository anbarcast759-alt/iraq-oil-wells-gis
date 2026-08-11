const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "charts", label: "Analytics" },
  { id: "explore", label: "Map & Wells" },
];

export default function SectionNav() {
  return (
    <nav className="sticky top-0 z-40 -mx-6 md:-mx-10 px-6 md:px-10 py-2.5 mb-8 bg-brand-navy/90 backdrop-blur-md border-b border-white/5">
      <div className="flex gap-1 overflow-x-auto">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="text-sm text-white/60 hover:text-brand-gold px-3 py-1.5 rounded-full hover:bg-white/5 whitespace-nowrap transition-colors"
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
