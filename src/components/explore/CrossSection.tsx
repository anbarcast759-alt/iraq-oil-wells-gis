import type { Well } from "@/types/well";
import { parseDepth } from "@/utils/depth";
import { haversineKm } from "@/utils/geo";
import { isEffectivelyHorizontal } from "@/utils/wellClassification";

interface CrossSectionProps {
  wells: [Well, Well];
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface WellGeometry {
  vertical: Segment;
  lateral: Segment | null;
  endX: number;
  endY: number;
}

/**
 * Not to horizontal scale — real well spacing varies from meters to
 * kilometers, and a to-scale plot would either crush both wells into
 * one pixel or need a huge canvas. This is a correlation-panel-style
 * schematic: depth (vertical) is accurate and to scale, horizontal
 * position between wells is fixed for readability, and the real
 * distance is called out as a label instead of implied by the drawing.
 *
 * Horizontal/lateral wells (per Well_Type) are drawn with a vertical
 * section down to TVD (the kick-off/landing point) then a horizontal
 * lateral segment — TD minus TVD is used as an approximate lateral
 * length, the standard rough proxy when a true directional survey
 * isn't available. Vertical wells stay a straight line to TD.
 */
export default function CrossSection({ wells }: CrossSectionProps) {
  const [a, b] = wells;
  const depthA = parseDepth(a.TD_Depth);
  const depthB = parseDepth(b.TD_Depth);

  if (depthA === null || depthB === null) {
    return (
      <div className="glass-card p-5 mb-4 text-sm text-white/40">
        Cross-section needs TD_Depth for both wells — one or both are missing it.
      </div>
    );
  }

  const distanceLabel =
    a.lat !== null && a.lng !== null && b.lat !== null && b.lng !== null
      ? `${haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }).toFixed(2)} km apart`
      : null;

  const width = 600;
  const height = 340;
  const surfaceY = 40;
  const usableHeight = height - surfaceY - 40;
  const maxDepth = Math.max(depthA, depthB);
  const scale = usableHeight / maxDepth;

  const xA = 150;
  const xB = 450;

  function wellGeometry(well: Well, depth: number, x: number, direction: 1 | -1): WellGeometry {
    const tvd = parseDepth(well.TVD);
    const horizontal = isEffectivelyHorizontal(well);

    if (horizontal && tvd !== null && depth > tvd) {
      const kickOffY = surfaceY + tvd * scale;
      const lateralLength = depth - tvd;
      // Capped so a very long lateral doesn't run off the diagram —
      // the "not to scale" note already covers horizontal distances.
      const lateralPx = Math.min(lateralLength * scale, 130);
      return {
        vertical: { x1: x, y1: surfaceY, x2: x, y2: kickOffY },
        lateral: { x1: x, y1: kickOffY, x2: x + direction * lateralPx, y2: kickOffY },
        endX: x + direction * lateralPx,
        endY: kickOffY,
      };
    }

    const bottomY = surfaceY + depth * scale;
    return {
      vertical: { x1: x, y1: surfaceY, x2: x, y2: bottomY },
      lateral: null,
      endX: x,
      endY: bottomY,
    };
  }

  const geomA = wellGeometry(a, depthA, xA, -1);
  const geomB = wellGeometry(b, depthB, xB, 1);

  return (
    <div className="glass-card p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-white/50">Geological Cross-Section (schematic)</p>
        {distanceLabel && <p className="text-xs text-white/40">{distanceLabel}</p>}
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={30} y1={surfaceY} x2={width - 30} y2={surfaceY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <text x={30} y={surfaceY - 8} fontSize={10} fill="rgba(255,255,255,0.4)">
          Surface
        </text>

        <WellTrace well={a} geom={geomA} color="#C9A24B" labelColor="#C9A24B" depth={depthA} x={xA} surfaceY={surfaceY} />
        <WellTrace well={b} geom={geomB} color="#3B5B84" labelColor="#8BA9D0" depth={depthB} x={xB} surfaceY={surfaceY} />

        {/* Correlation line at the shallower well's kick-off/TD level,
            projected across — a common cue in real correlation panels
            for spotting formation offset between wells. */}
        <line
          x1={xA}
          y1={Math.min(geomA.endY, geomB.endY)}
          x2={xB}
          y2={Math.min(geomA.endY, geomB.endY)}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      </svg>

      <p className="text-xs text-white/30 mt-1">
        Horizontal spacing and lateral length are schematic (lateral length ≈ TD − TVD) — vertical depth is to scale.
      </p>
    </div>
  );
}

function WellTrace({
  well,
  geom,
  color,
  labelColor,
  depth,
  x,
  surfaceY,
}: {
  well: Well;
  geom: WellGeometry;
  color: string;
  labelColor: string;
  depth: number;
  x: number;
  surfaceY: number;
}) {
  return (
    <g>
      <line x1={geom.vertical.x1} y1={geom.vertical.y1} x2={geom.vertical.x2} y2={geom.vertical.y2} stroke={color} strokeWidth={3} />
      {geom.lateral && (
        <line x1={geom.lateral.x1} y1={geom.lateral.y1} x2={geom.lateral.x2} y2={geom.lateral.y2} stroke={color} strokeWidth={3} />
      )}
      <circle cx={geom.endX} cy={geom.endY} r={4} fill={color} />
      <text x={x} y={surfaceY - 8} fontSize={11} fill={labelColor} textAnchor="middle" fontWeight={600}>
        {well.Well_Name || well.slug}
      </text>
      <text x={geom.endX} y={geom.endY + 16} fontSize={10} fill="rgba(255,255,255,0.6)" textAnchor="middle">
        TD {depth.toFixed(0)}m
      </text>
      {well.Productive_Formation && (
        <text x={geom.endX} y={geom.endY + 30} fontSize={9} fill="rgba(255,255,255,0.4)" textAnchor="middle">
          {well.Productive_Formation}
        </text>
      )}
    </g>
  );
}
