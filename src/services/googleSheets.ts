import Papa from "papaparse";
import { slugify, dedupeSlugs } from "@/utils/slug";
import { parseCoordinate } from "@/utils/coordinates";
import { utmToLatLon, parseUtmValue } from "@/utils/utm";
import type { Well, WellsDataset } from "@/types/well";

/**
 * WHY CSV EXPORT INSTEAD OF THE GOOGLE SHEETS API:
 * The Sheets API needs an API key or service account and per-project
 * setup. A sheet shared as "Anyone with the link: Viewer" can be read
 * as CSV with zero credentials via the export endpoint. That's the
 * simplest thing that satisfies "no JSON files, always live from the
 * sheet, no hardcoded values." If per-cell write access or private
 * sheets are needed later (Admin Panel milestone), this file is the
 * only place that needs to change — everything else consumes
 * `getWellsDataset()` and doesn't know how the data was fetched.
 */

function buildCsvUrl(): string {
  const sheetId = process.env.NEXT_PUBLIC_SHEET_ID;
  const gid = process.env.NEXT_PUBLIC_SHEET_GID ?? "0";

  if (!sheetId) {
    throw new Error(
      "NEXT_PUBLIC_SHEET_ID is not set. Add it to .env.local (see .env.example)."
    );
  }

  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
}

function toWell(row: Record<string, string>, columns: string[]): Well {
  // Keep every column, trimmed, regardless of whether we recognize it.
  const raw: Record<string, string> = {};
  for (const col of columns) {
    raw[col] = (row[col] ?? "").trim();
  }

  const name = raw["Well_Name"] ?? "";

  let lat = parseCoordinate(raw["Latitude"]);
  let lng = parseCoordinate(raw["Longitude"]);

  // Latitude/Longitude are decimal degrees; Surface_X/Surface_Y hold
  // projected UTM coordinates (Easting/Northing) instead — a
  // different system entirely. If decimal degrees weren't given,
  // fall back to converting UTM so the well still shows on the map.
  if (lat === null || lng === null) {
    const easting = parseUtmValue(raw["Surface_X"]);
    const northing = parseUtmValue(raw["Surface_Y"]);
    if (easting !== null && northing !== null) {
      const converted = utmToLatLon(easting, northing);
      lat = converted.lat;
      lng = converted.lng;
    }
  }

  return {
    ...raw,
    slug: slugify(name || `well-${Math.random().toString(36).slice(2, 8)}`),
    lat,
    lng,
    raw,
  };
}

let cache: { data: WellsDataset; expiresAt: number } | null = null;

/**
 * Fetches and parses the live sheet. Server-side cached in-memory for
 * SHEET_REVALIDATE_SECONDS so a burst of requests (e.g. map + dashboard
 * both loading) doesn't refetch the sheet multiple times, while still
 * staying close to real-time when the sheet is edited.
 */
export async function getWellsDataset(options?: { force?: boolean }): Promise<WellsDataset> {
  const revalidateSeconds = Number(process.env.SHEET_REVALIDATE_SECONDS ?? 30);
  const now = Date.now();

  if (!options?.force && cache && cache.expiresAt > now) {
    return cache.data;
  }

  const url = buildCsvUrl();
  const res = await fetch(url, {
    // Next.js server-side fetch cache, separate from our in-memory cache,
    // so this also plays nicely with ISR if this function is called
    // from a route that opts into it.
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Google Sheet (status ${res.status}). ` +
        `Confirm the sheet is shared as "Anyone with the link: Viewer".`
    );
  }

  const csvText = await res.text();
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const columns = (parsed.meta.fields ?? []).map((c) => c.trim()).filter(Boolean);

  const rows = parsed.data.filter((row) =>
    // Drop fully-blank rows (the sheet has many trailing empty rows).
    columns.some((col) => (row[col] ?? "").trim() !== "")
  );

  const wells = rows.map((row) => toWell(row, columns));
  const slugs = dedupeSlugs(wells.map((w) => w.slug));
  wells.forEach((w, i) => (w.slug = slugs[i]));

  const dataset: WellsDataset = {
    wells,
    columns,
    fetchedAt: new Date().toISOString(),
  };

  cache = { data: dataset, expiresAt: now + revalidateSeconds * 1000 };
  return dataset;
}

export async function getWellBySlug(slug: string): Promise<Well | null> {
  const { wells } = await getWellsDataset();
  return wells.find((w) => w.slug === slug) ?? null;
}
