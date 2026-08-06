"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Well } from "@/types/well";

// Leaflet's default marker icon references image paths that break
// under bundlers (Next/Webpack). This is the standard fix: point the
// default icon at the actual bundled asset URLs instead.
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Distinct gold marker for wells the chat assistant is pointing to.
// Public color-marker asset, same convention as the default icon above.
const highlightIcon = L.icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fallback center: East Baghdad South Oil Field, used only if no well
// has valid coordinates yet (e.g. sheet mid-edit).
const FALLBACK_CENTER: [number, number] = [33.3456, 44.5518];

type LocatedWell = Well & { lat: number; lng: number };

interface MapViewProps {
  wells: Well[];
  /** Slugs to fly to and mark gold, e.g. wells the chat assistant just answered about. */
  highlightSlugs?: string[];
}

export default function MapView({ wells, highlightSlugs = [] }: MapViewProps) {
  const located = wells.filter(
    (w): w is LocatedWell => w.lat !== null && w.lng !== null
  );

  const center: [number, number] =
    located.length > 0
      ? [
          located.reduce((sum, w) => sum + w.lat, 0) / located.length,
          located.reduce((sum, w) => sum + w.lng, 0) / located.length,
        ]
      : FALLBACK_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={located.length > 0 ? 11 : 8}
      className="h-full w-full rounded-xl2"
    >
      <TileLayer
        // OpenStreetMap by default (free, no key). Satellite/terrain
        // layer switching comes with the GIS Tools milestone.
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToHighlighted wells={located} highlightSlugs={highlightSlugs} />

      {located.map((well) => {
        const isHighlighted = highlightSlugs.includes(well.slug);
        return (
          <Marker
            key={well.slug}
            position={[well.lat, well.lng]}
            icon={isHighlighted ? highlightIcon : markerIcon}
            ref={(marker) => {
              // Auto-open the popup for a well the assistant just
              // pointed to, so the answer is visible without an extra click.
              if (marker && isHighlighted) marker.openPopup();
            }}
          >
            <Popup minWidth={240}>
              <div className="text-sm space-y-1">
                <p className="font-semibold">{well.Well_Name || "(unnamed)"}</p>
                <PopupRow label="Field" value={well.Field} />
                <PopupRow label="Governorate" value={well.Governorate} />
                <PopupRow
                  label="Coordinates"
                  value={`${well.lat.toFixed(5)}, ${well.lng.toFixed(5)}`}
                />
                <PopupRow label="TD" value={well.TD_Depth} />
                <PopupRow label="TVD" value={well.TVD} />
                <PopupRow label="Formation" value={well.Productive_Formation} />
                <PopupRow label="Reservoir" value={well.Reservoir} />
                <PopupRow label="Operator" value={well.Operator} />
                <PopupRow label="Rig" value={well.Rig} />
                <PopupRow label="Lithology" value={well.Lithology} />
                <PopupRow label="Remarks" value={well.Remarks} />
                <Link
                  href={`/wells/${well.slug}`}
                  className="inline-block mt-2 text-brand-navy font-medium underline"
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

/**
 * Lives inside MapContainer (needs useMap()) so it can pan/zoom the
 * SAME map instance the whole page already uses — no separate map,
 * no unmount/remount, which matters once this scales to ~200 wells.
 */
function FlyToHighlighted({
  wells,
  highlightSlugs,
}: {
  wells: LocatedWell[];
  highlightSlugs: string[];
}) {
  const map = useMap();
  // Guards against re-flying on every render when the slugs list is
  // the same array reference but wells re-fetched (revalidate tick).
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (highlightSlugs.length === 0) return;

    const key = highlightSlugs.join(",");
    if (key === lastKey.current) return;
    lastKey.current = key;

    const targets = wells.filter((w) => highlightSlugs.includes(w.slug));
    if (targets.length === 0) return;

    if (targets.length === 1) {
      map.flyTo([targets[0].lat, targets[0].lng], 14, { duration: 1 });
    } else {
      const bounds = L.latLngBounds(targets.map((w) => [w.lat, w.lng] as [number, number]));
      map.flyToBounds(bounds, { padding: [60, 60], duration: 1 });
    }
  }, [highlightSlugs, wells, map]);

  return null;
}

function PopupRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-black/50">{label}:</span> {value}
    </p>
  );
}
