"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Well } from "@/types/well";
import SearchBar from "./SearchBar";
import FilterBar, { EMPTY_FILTERS, type FilterState } from "./FilterBar";
import WellsList from "./WellsList";
import ComparisonPanel from "./ComparisonPanel";
import CrossSection from "./CrossSection";
import ExportButton from "./ExportButton";
import MapSection from "@/components/map/MapSection";
import MapColorControls from "@/components/map/MapColorControls";
import PresentationModeButton from "@/components/map/PresentationModeButton";
import { getFilterOptions } from "@/utils/filterOptions";
import { filterWells } from "@/utils/wellFilters";
import { buildColorMap, type ColorableField } from "@/utils/markerColors";
import { useHighlight } from "@/context/HighlightContext";

interface WellsExplorerProps {
  wells: Well[];
}

export default function WellsExplorer({ wells }: WellsExplorerProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [colorBy, setColorBy] = useState<ColorableField | null>(null);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const { highlightedSlugs } = useHighlight();
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Options are derived from the full dataset (not the filtered one) so
  // picking one filter never removes the other dropdown choices.
  const filterOptions = useMemo(() => getFilterOptions(wells), [wells]);

  const filtered = useMemo(
    () => filterWells(wells, query, filters),
    [wells, query, filters]
  );

  // Colors are computed from the FULL dataset (not the filtered view)
  // so a value's color never shifts as search/filters change.
  const colorMap = useMemo(
    () => (colorBy ? buildColorMap(wells, colorBy) : new Map<string, string>()),
    [wells, colorBy]
  );

  const legend = useMemo(
    () =>
      Array.from(colorMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([label, color]) => ({ label, color })),
    [colorMap]
  );

  const compareWells = useMemo(
    () => wells.filter((w) => compareSlugs.includes(w.slug)),
    [wells, compareSlugs]
  );

  function toggleCompare(slug: string) {
    setCompareSlugs((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : prev.length >= 2
          ? prev
          : [...prev, slug]
    );
  }

  // When the chat assistant highlights wells, make sure they're
  // actually visible: clear any active search/filter that might be
  // hiding them, and scroll the map into view.
  useEffect(() => {
    if (highlightedSlugs.length === 0) return;
    setQuery("");
    setFilters(EMPTY_FILTERS);
    mapWrapperRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedSlugs]);

  return (
    <div className="space-y-4">
      <div id="search-filters" className="scroll-mt-24 space-y-4">
        <SearchBar value={query} onChange={setQuery} />
        <FilterBar options={filterOptions} filters={filters} onChange={setFilters} />
        <MapColorControls colorBy={colorBy} onChange={setColorBy} legend={legend} />
      </div>

      <div ref={mapWrapperRef} id="interactive-map" className="map-wrapper relative scroll-mt-24">
        <PresentationModeButton targetRef={mapWrapperRef} />
        <MapSection
          wells={filtered}
          highlightSlugs={highlightedSlugs}
          colorBy={colorBy}
          colorMap={colorMap}
        />
      </div>

      {compareWells.length === 2 && (
        <>
          <CrossSection wells={[compareWells[0], compareWells[1]]} />
          <ComparisonPanel wells={compareWells} onClose={() => setCompareSlugs([])} />
        </>
      )}

      <div className="flex justify-end">
        <ExportButton wells={filtered} />
      </div>

      <div id="wells-list" className="scroll-mt-24">
        <WellsList
          wells={filtered}
          compareSlugs={compareSlugs}
          onToggleCompare={toggleCompare}
        />
      </div>
    </div>
  );
}
