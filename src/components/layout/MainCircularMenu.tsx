"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Clock,
  MapPinned,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

interface MenuItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const ITEMS: MenuItem[] = [
  { href: "#overview", label: "Overview", icon: LayoutDashboard },
  { href: "#insights", label: "Insights", icon: Sparkles },
  { href: "#distribution", label: "Distribution", icon: BarChart3 },
  { href: "#timeline", label: "Timeline", icon: Clock },
  { href: "#explore", label: "Map & Wells", icon: MapPinned },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

const SIZE = 420; // px, big by design — this is the primary nav now
const RADIUS = 160;
const NODE = 76;

export default function MainCircularMenu() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm text-white/70 hover:text-brand-gold px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu className="w-4 h-4" />
        Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-brand-navy/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div ref={ref} className="relative" style={{ width: SIZE, height: SIZE }}>
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 z-10 w-9 h-9 rounded-full bg-brand-navy-light border border-white/10 flex items-center justify-center hover:border-brand-gold transition-colors"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Two-tone arc ring, echoing the company logo's circular mark. */}
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 w-full h-full">
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={SIZE / 2 - 6}
                fill="none"
                stroke="#B5533C"
                strokeWidth="4"
                strokeDasharray={`${Math.PI * (SIZE - 12) * 0.48} ${Math.PI * (SIZE - 12)}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={SIZE / 2 - 6}
                fill="none"
                strokeWidth="4"
                strokeDasharray={`${Math.PI * (SIZE - 12) * 0.48} ${Math.PI * (SIZE - 12)}`}
                strokeLinecap="round"
                transform={`rotate(${180 - 90} ${SIZE / 2} ${SIZE / 2})`}
                style={{ stroke: "rgb(var(--fg-rgb) / 0.15)" }}
              />
            </svg>

            {/* Center hub: logo + active item preview */}
            <div
              className="absolute rounded-full bg-brand-gold/10 border border-brand-gold/30 flex flex-col items-center justify-center text-center px-4"
              style={{
                width: SIZE - RADIUS * 1.05,
                height: SIZE - RADIUS * 1.05,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt="Midland Oil Company"
                className="w-12 h-12 rounded-full object-cover mb-2"
              />
              <p className="text-sm font-medium leading-tight font-display">
                {activeIndex !== null ? ITEMS[activeIndex].label : "Menu"}
              </p>
            </div>

            {/* Surrounding icon nodes — the actual navigation */}
            {ITEMS.map((item, i) => {
              const angle = (i / ITEMS.length) * 2 * Math.PI - Math.PI / 2;
              const x = SIZE / 2 + RADIUS * Math.cos(angle) - NODE / 2;
              const y = SIZE / 2 + RADIUS * Math.sin(angle) - NODE / 2;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="absolute rounded-full bg-brand-navy-light border border-white/10 hover:border-brand-gold hover:bg-brand-gold/10 flex flex-col items-center justify-center gap-1 transition-colors"
                  style={{ width: NODE, height: NODE, left: x, top: y }}
                >
                  <Icon className="w-6 h-6 text-brand-gold" />
                  <span className="text-[10px] text-white/60 leading-none">{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
