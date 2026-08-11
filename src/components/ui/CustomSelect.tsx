"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

/**
 * Native <select> option lists are rendered by the OS/browser, not by
 * our CSS — Chrome/Edge on Windows in particular ignores dark theming
 * on the popup and shows it white-on-black-text no matter what we do.
 * Building the dropdown ourselves (same approach as MapColorControls)
 * is the only reliable fix.
 */
export default function CustomSelect({ label, value, options, onChange }: CustomSelectProps) {
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-left hover:bg-white/10"
      >
        <span className="truncate">
          {label}: {value || "All"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[1000] mt-1 w-full max-h-56 overflow-y-auto panel-solid p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-1.5 rounded-md ${
              value === "" ? "bg-brand-gold text-brand-navy" : "hover:bg-white/10"
            }`}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left text-sm px-3 py-1.5 rounded-md truncate ${
                value === opt ? "bg-brand-gold text-brand-navy" : "hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
