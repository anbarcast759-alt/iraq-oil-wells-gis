import Link from "next/link";
import type { Well } from "@/types/well";

interface WellsListProps {
  wells: Well[];
}

export default function WellsList({ wells }: WellsListProps) {
  if (wells.length === 0) {
    return (
      <section className="glass-card p-5 text-center text-white/40">
        No wells match the current search/filters.
      </section>
    );
  }

  return (
    <section className="glass-card p-5">
      <h2 className="text-lg font-medium mb-4">Wells ({wells.length})</h2>
      <ul className="divide-y divide-white/10">
        {wells.map((well) => (
          <li key={well.slug} className="py-3 flex justify-between gap-4">
            <div>
              <Link
                href={`/wells/${well.slug}`}
                className="font-medium hover:text-brand-gold"
              >
                {well.Well_Name || "(unnamed)"}
              </Link>
              <p className="text-sm text-white/50">
                {well.Field || "—"} · {well.Governorate || "—"}
              </p>
            </div>
            <div className="text-right text-sm text-white/50">
              <p>{well.TD_Depth || "—"}</p>
              <p>{well.Rig || "—"}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
