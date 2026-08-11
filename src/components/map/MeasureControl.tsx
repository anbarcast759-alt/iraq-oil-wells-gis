"use client";

import { useState } from "react";
import { useMapEvents, Marker, Polyline, Tooltip } from "react-leaflet";
import L, { type LatLng } from "leaflet";
import { Ruler } from "lucide-react";
import { haversineKm } from "@/utils/geo";

const measurePointIcon = L.divIcon({
  className: "",
  html: `<div style="width:10px;height:10px;border-radius:50%;background:#C9A24B;border:2px solid #0A1A2F;"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

export default function MeasureControl() {
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<LatLng[]>([]);

  useMapEvents({
    click(e) {
      if (!active) return;
      setPoints((prev) => (prev.length >= 2 ? [e.latlng] : [...prev, e.latlng]));
    },
  });

  const distance = points.length === 2 ? haversineKm(points[0], points[1]) : null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActive((v) => !v);
          setPoints([]);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute top-3 z-[1000] rounded-lg p-2 shadow-lg ${
          active ? "bg-brand-gold text-brand-navy" : "bg-brand-navy/90 text-white hover:bg-brand-navy"
        }`}
        style={{ left: "3.25rem" }}
        title={active ? "Click two points on the map" : "Measure distance"}
        aria-label="Toggle measure distance tool"
      >
        <Ruler className="w-4 h-4" />
      </button>

      {points.map((p, i) => (
        <Marker key={i} position={p} icon={measurePointIcon} />
      ))}

      {points.length === 2 && (
        <Polyline positions={points} pathOptions={{ color: "#C9A24B", weight: 3, dashArray: "6 6" }}>
          <Tooltip permanent direction="center" className="!bg-brand-navy !text-white !border-brand-gold">
            {distance!.toFixed(2)} km
          </Tooltip>
        </Polyline>
      )}
    </>
  );
}
