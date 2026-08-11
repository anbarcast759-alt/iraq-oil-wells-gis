"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, ChevronDown } from "lucide-react";
import { COLORABLE_FIELDS, type ColorableField } from "@/utils/markerColors";

interface MapColorControlsProps {
  colorBy: ColorableField | null;
  onChange: (field: ColorableField | null) => void;
  legend: { label: string; color: string }[];
}

const LABELS: Record<ColorableField, string> = Object.fromEntries(
  COLORABLE_FIELDS.map((f) => [f.field, f.label])
) as Record<ColorableField, string>;

export default function MapColorControls({
  colorBy,
  onChange,
  legend,
}: MapColorControlsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm bg-white/5 border border-white/10 rounded-full px-4 py-2 hover:bg-white/10"
      >
        <Palette className="w-4 h-4 text-brand-gold" />
        Color by: <span className="text-white/60">{colorBy ? LABELS[colorBy] : "None"}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[1000] mt-2 w-56 glass-card bg-brand-navy p-2 shadow-xl">
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg ${
              colorBy === null ? "bg-brand-gold text-brand-navy" : "hover:bg-white/5"
            }`}
          >
            None
          </button>
          {COLORABLE_FIELDS.map(({ field, label }) => (
            <button
              key={field}
              onClick={() => {
                onChange(field);
                setOpen(false);
              }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg ${
                colorBy === field ? "bg-brand-gold text-brand-navy" : "hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}

          {colorBy && legend.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10 px-1 max-h-40 overflow-y-auto space-y-1">
              {legend.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-white/60">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
