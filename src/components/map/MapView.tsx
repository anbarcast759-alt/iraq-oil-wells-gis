"use client";

import { useEffect, useRef, Fragment } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import type { Well } from "@/types/well";
import { colorForWell, type ColorableField } from "@/utils/markerColors";
import { detectHazards } from "@/utils/hazards";
import { computeBottomHole } from "@/utils/trajectory";
import MeasureControl from "./MeasureControl";

// Distinct gold marker for wells the chat assistant is pointing to.
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

// Default (non-colored) pin color — kept distinct from gold, which is
// reserved for the assistant's highlight so the two never look alike.
const DEFAULT_PIN_COLOR = "#3B5B84";

// Inline SVG pins (not image URLs) so color and hazard badge can both
// be dynamic. Cached by "color|hazard" so identical markers reuse one
// L.DivIcon instead of rebuilding per marker.
const pinIconCache = new Map<string, L.DivIcon>();

// Small diamond marker for the computed bottom-hole location — visually
// distinct from the surface pin so the two are never confused.
const bottomHoleIcon = L.divIcon({
  className: "",
  html: `<div style="width:12px;height:12px;background:#0A1A2F;border:2px solid #C9A24B;transform:rotate(45deg);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function getPinIcon(color: string, hazard: boolean): L.DivIcon {
  const key = `${color}|${hazard}`;
  const cached = pinIconCache.get(key);
  if (cached) return cached;

  const badge = hazard
    ? `<circle cx="19" cy="7" r="6" fill="#DC2626" stroke="#0A1A2F" stroke-width="1.5" />
       <text x="19" y="9.5" font-size="8" font-weight="700" text-anchor="middle" fill="white">!</text>`
    : "";

  const icon = L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41" overflow="visible">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z"
        fill="${color}" stroke="#0A1A2F" stroke-width="1.5" />
      <circle cx="12.5" cy="12.5" r="4.5" fill="#0A1A2F" opacity="0.4" />
      ${badge}
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  pinIconCache.set(key, icon);
  return icon;
}

type LocatedWell = Well & { lat: number; lng: number };

interface MapViewProps {
  wells: Well[];
  /** Slugs to fly to and mark gold, e.g. wells the chat assistant just answered about. */
  highlightSlugs?: string[];
  /** When set, non-highlighted markers are colored by this field's value. */
  colorBy?: ColorableField | null;
  colorMap?: Map<string, string>;
}

export default function MapView({
  wells,
  highlightSlugs = [],
  colorBy = null,
  colorMap = new Map(),
}: MapViewProps) {
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
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Street">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite">
          <TileLayer
            attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Terrain">
          <TileLayer
            attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <FlyToHighlighted wells={located} highlightSlugs={highlightSlugs} />
      <MeasureControl />

      {located.map((well) => {
        const isHighlighted = highlightSlugs.includes(well.slug);
        const hazards = detectHazards(well);
        const color = colorBy ? colorForWell(well, colorBy, colorMap) : DEFAULT_PIN_COLOR;
        const icon = isHighlighted ? highlightIcon : getPinIcon(color, hazards.length > 0);
        const bottomHole = computeBottomHole(well);
        return (
          <Fragment key={well.slug}>
            {bottomHole && (
              <>
                <Polyline
                  positions={[
                    [well.lat, well.lng],
                    [bottomHole.lat, bottomHole.lng],
                  ]}
                  pathOptions={{ color: "#C9A24B", weight: 2, dashArray: "4 6", opacity: 0.6 }}
                />
                <Marker position={[bottomHole.lat, bottomHole.lng]} icon={bottomHoleIcon}>
                  <Popup minWidth={200}>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">
                        {well.Well_Name || "(unnamed)"} — Bottom-Hole
                      </p>
                      <p className="text-black/50">
                        Computed from Inclination/Azimuth at TD (Minimum Curvature Method)
                      </p>
                      <p>TVD: {bottomHole.tvd.toFixed(1)} m</p>
                      <p>Horizontal displacement: {bottomHole.horizontalDisplacement.toFixed(1)} m</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
            <Marker
              position={[well.lat, well.lng]}
              icon={icon}
              ref={(marker) => {
                // Auto-open the popup for a well the assistant just
                // pointed to, so the answer is visible without an extra click.
                if (marker && isHighlighted) marker.openPopup();
              }}
            >
              <Popup minWidth={240}>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">{well.Well_Name || "(unnamed)"}</p>
                  {hazards.length > 0 && (
                    <p className="text-red-600 font-medium">
                      ⚠ {hazards.join(", ")}
                    </p>
                  )}
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
          </Fragment>
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
