import MainCircularMenu from "./MainCircularMenu";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function SectionNav() {
  return (
    <nav className="sticky top-0 z-40 -mx-6 md:-mx-10 px-6 md:px-10 py-2.5 mb-8 bg-brand-navy/90 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center justify-between gap-2">
        <MainCircularMenu />
        <ThemeToggle />
      </div>
    </nav>
  );
}
