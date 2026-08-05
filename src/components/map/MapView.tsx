"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

// Fallback center: East Baghdad South Oil Field, used only if no well
// has valid coordinates yet (e.g. sheet mid-edit).
const FALLBACK_CENTER: [number, number] = [33.3456, 44.5518];

interface MapViewProps {
  wells: Well[];
}

export default function MapView({ wells }: MapViewProps) {
  const located = wells.filter(
    (w): w is Well & { lat: number; lng: number } => w.lat !== null && w.lng !== null
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

      {located.map((well) => (
        <Marker key={well.slug} position={[well.lat, well.lng]} icon={markerIcon}>
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
              <PopupRow label="Status" value={well.Well_Status} />
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
      ))}
    </MapContainer>
  );
}

function PopupRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <span className="text-black/50">{label}:</span> {value}
    </p>
  );
}
