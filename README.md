# Iraq Oil Wells GIS Platform — Milestone 1: Architecture

Status: **Milestone 1 complete.** Project structure, types, utilities,
and the Google Sheets service are in place and compile-clean. No UI
feature is fully built yet — that starts at Milestone 2.

## What's here

```
src/
  app/
    layout.tsx          root layout (fonts, RTL/LTR hook point)
    page.tsx             home page skeleton (stats/map placeholders)
    globals.css           Tailwind + glassmorphism tokens
    wells/[slug]/page.tsx  well detail route stub
    api/wells/route.ts      JSON API over the live sheet
  services/
    googleSheets.ts    the ONLY place that knows how data is fetched
  types/
    well.ts             Well / WellsDataset — dynamic-column-safe
  utils/
    slug.ts               Well_Name -> URL-safe, collision-free slug
    coordinates.ts         parses "33.345638° N" style sheet values
```

## Key architectural decisions

1. **No Well_ID column exists in the sheet**, so wells are identified
   by a `slug` derived from `Well_Name` (see `utils/slug.ts`). If a
   `Well_ID` column is added later, switching the identifier is a
   one-line change in `services/googleSheets.ts` (`toWell()`).

2. **Data source: CSV export, not the Sheets API.** The sheet must be
   shared as *"Anyone with the link: Viewer."* This avoids needing an
   API key or service account for read access, while still satisfying
   "no JSON files, always live, no hardcoded values." See the comment
   block at the top of `services/googleSheets.ts` for the tradeoff —
   this is the one file to revisit if the Admin Panel milestone needs
   write access or the sheet must stay private.

3. **Dynamic columns are handled at the type level.** `Well` has a
   `raw: Record<string, string>` field holding every column exactly as
   the sheet names it, so a new column in the sheet never breaks a
   build — it just isn't specially rendered until you choose to.

4. **In-memory server cache** (`SHEET_REVALIDATE_SECONDS`, default 30s)
   avoids refetching the sheet on every request while keeping edits
   visible quickly. Lower it for near-real-time, raise it to cut load.

## Setup

```bash
cp .env.example .env.local
# edit .env.local if your sheet ID/tab differs
npm install
npm run dev
```

## Known data gap (from the current sheet)

Only one well row exists right now (`EBSH3B1-6-2H / EBS-160`), and its
`Productive_Formation`, `Operator`, `API`, and `Remarks` cells are
empty. That's a data-entry gap, not a code issue — the app already
handles missing fields gracefully (blank string / `null` coordinates
rather than crashing).

## Next milestone

**Milestone 2 — Connect Google Sheets:** wire `getWellsDataset()` into
`page.tsx`'s stat cards and confirm live edits in the sheet appear
without a rebuild.
