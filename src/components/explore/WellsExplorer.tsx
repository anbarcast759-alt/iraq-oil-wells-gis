"use client";

import { useMemo, useState } from "react";
import type { Well } from "@/types/well";
import SearchBar from "./SearchBar";
import FilterBar, { EMPTY_FILTERS, type FilterState } from "./FilterBar";
import WellsList from "./WellsList";
import MapSection from "@/components/map/MapSection";
import { getFilterOptions } from "@/utils/filterOptions";
import { filterWells } from "@/utils/wellFilters";

interface WellsExplorerProps {
  wells: Well[];
}

export default function WellsExplorer({ wells }: WellsExplorerProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  // Options are derived from the full dataset (not the filtered one) so
  // picking one filter never removes the other dropdown choices.
  const filterOptions = useMemo(() => getFilterOptions(wells), [wells]);

  const filtered = useMemo(
    () => filterWells(wells, query, filters),
    [wells, query, filters]
  );

  return (
    <div className="space-y-4">
      <SearchBar value={query} onChange={setQuery} />
      <FilterBar options={filterOptions} filters={filters} onChange={setFilters} />

      <MapSection wells={filtered} />

      <WellsList wells={filtered} />
    </div>
  );
}
