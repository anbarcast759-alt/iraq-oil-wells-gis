import Link from "next/link";

interface SiteHeaderProps {
  fetchedAt?: string;
}

// Deterministic jagged waveform (not random — must render identically
// on server and client). Values are amplitude fractions (-1..1),
// meant to read as a well-log / seismic trace, not a decorative squiggle.
const TRACE_AMPLITUDES = [
  0, 0.5, -0.25, 0.85, -0.6, 0.15, -0.9, 0.4, -0.15, 0.75, -0.45, 0.05, -0.8,
  0.35, -0.1, 0.65, -0.55, 0.25, -0.35, 0.9, -0.85, 0.2, 0.55, -0.25, 0.4,
  -0.65, 0.1, -0.3, 0.7, -0.4, 0.3, -0.7, 0.5, -0.2, 0.6, -0.5, 0.2, -0.4, 0.3,
  0,
];

function buildTracePath(width: number, height: number): string {
  const points = TRACE_AMPLITUDES.length;
  const step = width / (points - 1);
  const mid = height / 2;
  let d = `M0,${mid}`;
  TRACE_AMPLITUDES.forEach((amp, i) => {
    if (i === 0) return;
    const x = (i * step).toFixed(1);
    const y = (mid + amp * mid * 0.85).toFixed(1);
    d += ` L${x},${y}`;
  });
  return d;
}

export default function SiteHeader({ fetchedAt }: SiteHeaderProps) {
  const tracePath = buildTracePath(1000, 48);

  return (
    <header className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Midland Oil Company"
            className="w-12 h-12 rounded-full object-cover border border-white/10 shrink-0"
          />
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-brand-gold">
              Iraq Oil Wells GIS Platform
            </h1>
            <p className="mt-0.5 text-white/60 text-sm">
              East Baghdad South Oil Field — live from Google Sheets
            </p>
          </div>
        </div>

        {fetchedAt && (
          <p className="text-xs text-white/40 text-right">
            Last synced: {new Date(fetchedAt).toLocaleString()}
            <br />
            <Link href="/admin" className="hover:text-white/70">
              Admin →
            </Link>
          </p>
        )}
      </div>

      {/* Signature element: a well-log / seismic trace line — grounded
          in what this platform actually shows, not a generic gradient
          divider. Wipes in once on load; respects reduced motion. */}
      <div className="mt-5 h-10 overflow-hidden seismic-reveal">
        <svg
          viewBox="0 0 1000 48"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path
            d={tracePath}
            fill="none"
            stroke="url(#trace-gradient)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="trace-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C9A24B" stopOpacity="0" />
              <stop offset="15%" stopColor="#C9A24B" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#C9A24B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C9A24B" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </header>
  );
}
