import { LayoutDashboard, BarChart3, MapPinned } from "lucide-react";
import { getWellsDataset } from "@/services/googleSheets";
import { computeWellStats } from "@/utils/stats";
import WellsExplorer from "@/components/explore/WellsExplorer";
import StatsGrid from "@/components/dashboard/StatsGrid";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import DepthChart from "@/components/dashboard/DepthChart";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import FadeIn from "@/components/ui/FadeIn";
import SiteHeader from "@/components/layout/SiteHeader";
import SectionNav from "@/components/layout/SectionNav";
import SectionHeader from "@/components/layout/SectionHeader";

/**
 * The page is organized into three clearly labeled, anchor-linked
 * sections (Overview / Analytics / Map & Wells) via SectionNav +
 * SectionHeader, instead of one long unbroken stack of cards — makes
 * a long page navigable and gives each block a clear identity.
 *
 * `export const revalidate` makes Next.js itself re-render this page
 * on the server periodically (separate from the in-memory cache in
 * googleSheets.ts), so a page refresh reliably shows recent edits.
 */
export const revalidate = 15;

export default async function HomePage() {
  let errorMessage: string | null = null;
  let stats = null;
  let wells: Awaited<ReturnType<typeof getWellsDataset>>["wells"] = [];
  let fetchedAt = "";

  try {
    const dataset = await getWellsDataset();
    wells = dataset.wells;
    fetchedAt = dataset.fetchedAt;
    stats = computeWellStats(wells);
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <main className="min-h-screen px-6 md:px-10 pb-10">
      <div className="pt-6 md:pt-10">
        <SiteHeader fetchedAt={fetchedAt} />
      </div>

      <SectionNav />

      {errorMessage && (
        <div className="glass-card p-5 mb-8 border-red-400/40 bg-red-500/10">
          <p className="font-medium text-red-300">Could not load the sheet</p>
          <p className="text-sm text-red-200/80 mt-1">{errorMessage}</p>
          <p className="text-sm text-white/60 mt-2">
            Check that the sheet is shared as &quot;Anyone with the link:
            Viewer&quot; and that NEXT_PUBLIC_SHEET_ID in .env.local is
            correct.
          </p>
        </div>
      )}

      <section id="overview" className="scroll-mt-20">
        <SectionHeader
          icon={LayoutDashboard}
          title="Field Overview"
          description="Key numbers across the whole dataset"
        />
        {stats && (
          <FadeIn delay={0}>
            <StatsGrid stats={stats} />
          </FadeIn>
        )}
      </section>

      <section id="charts" className="scroll-mt-20 mt-12">
        <SectionHeader
          icon={BarChart3}
          title="Analytics"
          description="Distribution and depth across all wells"
        />
        <FadeIn delay={0.1}>
          <InsightsPanel wells={wells} />
          <DistributionCharts wells={wells} />
        </FadeIn>
        <FadeIn delay={0.2}>
          <DepthChart wells={wells} />
        </FadeIn>
      </section>

      <section id="explore" className="scroll-mt-20 mt-12">
        <SectionHeader
          icon={MapPinned}
          title="Map & Wells"
          description="Search, filter, compare, and explore every well"
        />
        <FadeIn delay={0.3}>
          <WellsExplorer wells={wells} />
        </FadeIn>
      </section>
    </main>
  );
}
