import Link from "next/link";
import { MapPinned } from "lucide-react";
import type { Well } from "@/types/well";
import { findNearbyWells } from "@/utils/spacing";

interface NearbyWellsProps {
  well: Well;
  allWells: Well[];
}

export default function NearbyWells({ well, allWells }: NearbyWellsProps) {
  const nearby = findNearbyWells(well, allWells, 500);
  if (nearby.length === 0) return null;

  return (
    <div className="glass-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-3 text-white/50">
        <MapPinned className="w-4 h-4" />
        <p className="text-sm">Nearby Wells (within 500m)</p>
      </div>
      <ul className="space-y-2 text-sm">
        {nearby.map(({ well: n, distanceMeters }) => (
          <li key={n.slug} className="flex items-center justify-between">
            <Link href={`/wells/${n.slug}`} className="hover:text-brand-gold">
              {n.Well_Name || n.slug}
            </Link>
            <span className="text-white/40">{distanceMeters.toFixed(0)} m</span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/30 mt-3">
        Surface distance only — expected for wells sharing a horizontal drilling pad.
      </p>
    </div>
  );
}
