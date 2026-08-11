"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { FILTERABLE_FIELDS, type FilterableField } from "@/utils/filterOptions";

export interface FilterState {
  fields: Partial<Record<FilterableField, string>>;
  depthMin: string;
  depthMax: string;
}

export const EMPTY_FILTERS: FilterState = {
  fields: {},
  depthMin: "",
  depthMax: "",
};

const FIELD_LABELS: Record<FilterableField, string> = {
  Field: "Field",
  Productive_Formation: "Formation",
  Reservoir: "Reservoir",
  Governorate: "Governorate",
  Operator: "Operator",
  Rig: "Rig",
  Well_Type: "Well Type",
  Lithology: "Lithology",
};

interface FilterBarProps {
  options: Record<FilterableField, string[]>;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({ options, filters, onChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const activeCount =
    Object.values(filters.fields).filter(Boolean).length +
    (filters.depthMin ? 1 : 0) +
    (filters.depthMax ? 1 : 0);

  function setField(field: FilterableField, value: string) {
    const next = { ...filters.fields };
    if (value) next[field] = value;
    else delete next[field];
    onChange({ ...filters, fields: next });
  }

  return (
    <div className="glass-card p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between"
      >
        <span className="flex items-center gap-2 text-sm text-white/70">
          <SlidersHorizontal className="w-4 h-4" />
          Filters{activeCount > 0 ? ` (${activeCount} active)` : ""}
        </span>
        <span className="flex items-center gap-3">
          {activeCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(EMPTY_FILTERS);
              }}
              className="flex items-center gap-1 text-sm text-white/50 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {FILTERABLE_FIELDS.map((field) => (
            <select
              key={field}
              value={filters.fields[field] ?? ""}
              onChange={(e) => setField(field, e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
            >
              <option value="">{FIELD_LABELS[field]}: All</option>
              {options[field].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          ))}

          <input
            type="number"
            inputMode="decimal"
            placeholder="Min depth (m)"
            value={filters.depthMin}
            onChange={(e) => onChange({ ...filters, depthMin: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
          />
          <input
            type="number"
            inputMode="decimal"
            placeholder="Max depth (m)"
            value={filters.depthMax}
            onChange={(e) => onChange({ ...filters, depthMax: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-gold/50"
          />
        </div>
      )}
    </div>
  );
}
