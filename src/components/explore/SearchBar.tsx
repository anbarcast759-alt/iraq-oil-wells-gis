"use client";

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by well name, field, formation, reservoir, operator, rig…"
        className="w-full glass-card pl-10 pr-4 py-3 bg-white/5 placeholder:text-white/30 outline-none focus:ring-1 focus:ring-brand-gold/50"
      />
    </div>
  );
}
