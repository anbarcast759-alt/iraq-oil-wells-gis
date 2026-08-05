"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Well } from "@/types/well";
import SearchBar from "./SearchBar";
import FilterBar, { EMPTY_FILTERS, type FilterState } from "./FilterBar";
import WellsList from "./WellsList";
import MapSection from "@/components/map/MapSection";
import { getFilterOptions } from "@/utils/filterOptions";
import { filterWells } from "@/utils/wellFilters";
import { useHighlight } from "@/context/HighlightContext";

interface WellsExplorerProps {
  wells: Well[];
}

export default function WellsExplorer({ wells }: WellsExplorerProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const { highlightedSlugs } = useHighlight();
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Options are derived from the full dataset (not the filtered one) so
  // picking one filter never removes the other dropdown choices.
  const filterOptions = useMemo(() => getFilterOptions(wells), [wells]);

  const filtered = useMemo(
    () => filterWells(wells, query, filters),
    [wells, query, filters]
  );

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
      <SearchBar value={query} onChange={setQuery} />
      <FilterBar options={filterOptions} filters={filters} onChange={setFilters} />

      <div ref={mapWrapperRef}>
        <MapSection wells={filtered} highlightSlugs={highlightedSlugs} />
      </div>

      <WellsList wells={filtered} />
    </div>
  );
}
