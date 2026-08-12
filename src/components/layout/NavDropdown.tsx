"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { ChevronDown } from "lucide-react";

export interface NavSubItem {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavDropdownProps {
  label: string;
  icon: ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

const SIZE = 300; // px, the circular panel's diameter
const RADIUS = 108; // px, distance of each icon node from center
const NODE = 56; // px, each icon node's diameter

export default function NavDropdown({ label, icon: Icon, items }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
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
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-sm text-white/60 hover:text-brand-gold px-3 py-1.5 rounded-full hover:bg-white/5 whitespace-nowrap transition-colors"
      >
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-[1000] mt-4 panel-solid shadow-2xl p-6"
          style={{ width: SIZE + 48 }}
        >
          <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
            {/* Two-tone arc ring, echoing the company logo's circular mark. */}
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="absolute inset-0 w-full h-full"
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={SIZE / 2 - 4}
                fill="none"
                stroke="#B5533C"
                strokeWidth="3"
                strokeDasharray={`${Math.PI * (SIZE - 8) * 0.48} ${Math.PI * (SIZE - 8)}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={SIZE / 2 - 4}
                fill="none"
                stroke="#0A1A2F"
                strokeWidth="3"
                strokeDasharray={`${Math.PI * (SIZE - 8) * 0.48} ${Math.PI * (SIZE - 8)}`}
                strokeLinecap="round"
                transform={`rotate(${180 - 90} ${SIZE / 2} ${SIZE / 2})`}
                className="text-white/10"
                style={{ stroke: "currentColor" }}
              />
            </svg>

            {/* Center hub */}
            <div
              className="absolute rounded-full bg-brand-gold/10 border border-brand-gold/30 flex flex-col items-center justify-center text-center px-3"
              style={{
                width: SIZE - RADIUS * 0.9,
                height: SIZE - RADIUS * 0.9,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <Icon className="w-5 h-5 text-brand-gold mb-1" />
              <p className="text-xs font-medium leading-tight">
                {activeIndex !== null ? items[activeIndex].label : label}
              </p>
              {activeIndex !== null && (
                <p className="text-[10px] text-white/40 mt-1 leading-tight">
                  {items[activeIndex].description}
                </p>
              )}
            </div>

            {/* Surrounding icon nodes */}
            {items.map((item, i) => {
              const angle = (i / items.length) * 2 * Math.PI - Math.PI / 2;
              const x = SIZE / 2 + RADIUS * Math.cos(angle) - NODE / 2;
              const y = SIZE / 2 + RADIUS * Math.sin(angle) - NODE / 2;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="absolute rounded-full bg-brand-navy-light border border-white/10 hover:border-brand-gold hover:bg-brand-gold/10 flex items-center justify-center transition-colors"
                  style={{ width: NODE, height: NODE, left: x, top: y }}
                  title={item.label}
                >
                  <item.icon className="w-5 h-5 text-brand-gold" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
