import { getWellsDataset } from "@/services/googleSheets";
import { computeWellStats } from "@/utils/stats";
import WellsExplorer from "@/components/explore/WellsExplorer";
import StatsGrid from "@/components/dashboard/StatsGrid";
import DistributionCharts from "@/components/dashboard/DistributionCharts";
import Link from "next/link";

/**
 * Milestone 5 scope: full dashboard stats (incl. Abandoned, Deepest
 * Well) and the three required distribution charts (Formation, Field,
 * Operator) are live. Both StatsGrid and DistributionCharts read the
 * FULL dataset, not the filtered one from WellsExplorer below — the
 * dashboard describes the whole field, independent of what you're
 * currently searching for.
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
    <main className="min-h-screen p-6 md:p-10">
      <header className="mb-8 flex items-baseline justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-brand-gold">
            Iraq Oil Wells GIS Platform
          </h1>
          <p className="mt-1 text-white/60">
            East Baghdad South Oil Field — live from Google Sheets
          </p>
        </div>
        {fetchedAt && (
          <p className="text-xs text-white/40">
            Last synced: {new Date(fetchedAt).toLocaleString()}
            <br />
            <Link href="/admin" className="hover:text-white/70">
              Admin →
            </Link>
          </p>
        )}
      </header>

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

      {stats && <StatsGrid stats={stats} />}

      <DistributionCharts wells={wells} />

      <WellsExplorer wells={wells} />
    </main>
  );
}
