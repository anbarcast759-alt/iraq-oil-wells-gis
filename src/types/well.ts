/**
 * Well_Name is currently the only column guaranteed to identify a row
 * (there is no Well_ID column in the source sheet). `slug` is derived
 * from Well_Name for routing (e.g. /wells/[slug]) and is safe even if
 * two wells briefly share a name (a numeric suffix is appended).
 */

// Columns we currently know about and actively use for typed UI
// (map popups, cards, filters). Anything NOT in this list still
// flows through via `raw` / `extra`, so new sheet columns never
// break the app — they just aren't specially rendered yet.
export interface KnownWellFields {
  Well_Name?: string;
  Field?: string;
  Governorate?: string;
  Latitude?: string;
  Longitude?: string;
  Surface_X?: string;
  Surface_Y?: string;
  TD_Depth?: string;
  TVD?: string;
  Productive_Formation?: string;
  Reservoir?: string;
  Well_Type?: string;
  Well_Status?: string;
  Rig?: string;
  Spud_Date?: string;
  Completion_Date?: string;
  Operator?: string;
  API?: string;
  Remarks?: string;
}

export interface Well extends KnownWellFields {
  /** Derived, stable identifier for this row (URL-safe). */
  slug: string;
  /** Parsed decimal latitude, or null if missing/unparseable. */
  lat: number | null;
  /** Parsed decimal longitude, or null if missing/unparseable. */
  lng: number | null;
  /**
   * Every column from the sheet, known or not, keyed exactly as the
   * header row names it. This is what makes new columns "just work":
   * generic table/detail views can iterate `Object.entries(raw)`
   * without any code change.
   */
  raw: Record<string, string>;
}

export interface WellsDataset {
  wells: Well[];
  /** Column headers in the order they appear in the sheet. */
  columns: string[];
  fetchedAt: string;
}
