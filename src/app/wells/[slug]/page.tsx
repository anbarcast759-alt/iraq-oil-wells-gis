/**
 * Milestone 6: full well detail page.
 *   - mini map + at-a-glance key facts
 *   - complete data table, built from `well.raw` so any FUTURE sheet
 *     column shows up automatically without touching this file
 *   - Google Maps link
 *   - placeholders for future attachments (gallery, PDF, LAS, mud
 *     logs, core photos) per the original spec
 */
import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Image as ImageIcon, FileText, Database, FlaskConical, Camera, AlertTriangle, Layers } from "lucide-react";
import { getWellBySlug, getWellsDataset } from "@/services/googleSheets";
import MapSection from "@/components/map/MapSection";
import { humanizeColumn } from "@/utils/format";
import { detectHazards } from "@/utils/hazards";
import { wellFormations, isMultiFormation } from "@/utils/multiFormation";
import { computeBottomHole } from "@/utils/trajectory";
import { drillingDays } from "@/utils/drillingDuration";
import LifecycleTimeline from "@/components/wells/LifecycleTimeline";
import CompletenessBadge from "@/components/wells/CompletenessBadge";
import NearbyWells from "@/components/wells/NearbyWells";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const well = await getWellBySlug(slug);

  if (!well) {
    return { title: "Well not found — Iraq Oil Wells GIS Platform" };
  }

  const name = well.Well_Name || slug;
  const description = [well.Field, well.Productive_Formation, well.TD_Depth]
    .filter(Boolean)
    .join(" · ");

  return {
    title: `${name} — Iraq Oil Wells GIS Platform`,
    description: description || `Well details for ${name}.`,
  };
}

export default async function WellDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const well = await getWellBySlug(slug);
  if (!well) notFound();

  const { wells: allWells } = await getWellsDataset();

  const googleMapsUrl =
    well.lat !== null && well.lng !== null
      ? `https://www.google.com/maps?q=${well.lat},${well.lng}`
      : null;

  const hazards = detectHazards(well);
  const bottomHole = computeBottomHole(well);

  const KEY_FACTS: { label: string; value?: string }[] = [
    { label: "Well No.", value: well.raw["Well No."] || well.raw["Well_No"] },
    { label: "Field", value: well.Field },
    { label: "Governorate", value: well.Governorate },
    {
      label: "Coordinates",
      value:
        well.lat !== null && well.lng !== null
          ? `${well.lat.toFixed(6)}, ${well.lng.toFixed(6)}`
          : undefined,
    },
    { label: "TD", value: well.TD_Depth },
    { label: "TVD", value: well.TVD },
    { label: "Inclination at TD", value: well.Inclination_TD ? `${well.Inclination_TD}°` : undefined },
    { label: "Azimuth at TD", value: well.Azimuth_TD ? `${well.Azimuth_TD}°` : undefined },
    { label: "Productive Formation", value: well.Productive_Formation },
    { label: "Reservoir", value: well.Reservoir },
    { label: "Well Type", value: well.Well_Type },
    { label: "Lithology", value: well.Lithology },
    { label: "Rig", value: well.Rig },
    { label: "Spud Date", value: well.Spud_Date },
    { label: "Completion Date", value: well.Completion_Date },
    {
      label: "Drilling Duration",
      value: drillingDays(well) !== null ? `${drillingDays(well)!.toFixed(0)} days` : undefined,
    },
    { label: "Operator", value: well.Operator },
    { label: "API", value: well.API },
  ];

  return (
    <main className="min-h-screen p-6 md:p-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all wells
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-brand-gold">
          {well.Well_Name || "(unnamed well)"}
        </h1>
        <p className="mt-1 text-white/60">
          {well.Field || "—"} · {well.Governorate || "—"}
        </p>
      </header>

      {hazards.length > 0 && (
        <div className="glass-card p-4 mb-6 border-red-400/30 bg-red-500/5 flex items-center gap-2 text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">Flagged in remarks: {hazards.join(", ")}</p>
        </div>
      )}

      {isMultiFormation(well) && (
        <div className="glass-card p-4 mb-6 border-brand-gold/30 bg-brand-gold/5 flex items-center gap-2 text-brand-gold">
          <Layers className="w-4 h-4 shrink-0" />
          <p className="text-sm font-medium">
            Lateral well — produces from {wellFormations(well).length} formations:{" "}
            {wellFormations(well).join(", ")}
          </p>
        </div>
      )}

      <CompletenessBadge well={well} variant="full" />

      {bottomHole && (
        <div className="glass-card p-4 mb-6">
          <p className="text-sm text-white/50 mb-2">
            Computed Bottom-Hole Location <span className="text-white/30 text-xs">(Minimum Curvature Method)</span>
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-white/40 text-xs">Bottom-Hole Coordinates</p>
              <p>{bottomHole.lat.toFixed(6)}, {bottomHole.lng.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Computed TVD</p>
              <p>{bottomHole.tvd.toFixed(1)} m</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Horizontal Displacement</p>
              <p>{bottomHole.horizontalDisplacement.toFixed(1)} m</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <LifecycleTimeline well={well} />
      </div>

      <NearbyWells well={well} allWells={allWells} />

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="h-[320px]">
          <MapSection wells={[well]} height={320} />
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm text-white/50 mb-4">Key Facts</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {KEY_FACTS.filter((f) => f.value).map((fact) => (
              <div key={fact.label}>
                <dt className="text-white/40">{fact.label}</dt>
                <dd className="mt-0.5">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-5 text-brand-gold hover:text-brand-gold-light text-sm font-medium"
            >
              Open in Google Maps
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {well.Remarks && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm text-white/50 mb-2">Remarks</h2>
          <p className="text-sm">{well.Remarks}</p>
        </div>
      )}

      <div className="glass-card p-5 mb-6">
        <h2 className="text-sm text-white/50 mb-4">Complete Data</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/10">
              {Object.entries(well.raw).map(([column, value]) => (
                <tr key={column}>
                  <td className="py-2 pr-4 text-white/40 whitespace-nowrap align-top">
                    {humanizeColumn(column)}
                  </td>
                  <td className="py-2">{value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section>
        <h2 className="text-sm text-white/50 mb-3">Attachments</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <AttachmentPlaceholder icon={ImageIcon} label="Image Gallery" />
          <AttachmentPlaceholder icon={FileText} label="PDF Reports" />
          <AttachmentPlaceholder icon={Database} label="LAS Files" />
          <AttachmentPlaceholder icon={FlaskConical} label="Mud Logs" />
          <AttachmentPlaceholder icon={Camera} label="Core Photos" />
        </div>
      </section>
    </main>
  );
}

function AttachmentPlaceholder({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="glass-card p-4 text-center text-white/30">
      <Icon className="w-5 h-5 mx-auto mb-2" />
      <p className="text-xs">{label}</p>
      <p className="text-[10px] mt-1">Coming soon</p>
    </div>
  );
}
