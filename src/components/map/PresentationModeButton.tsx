"use client";

import { useEffect, useState, type RefObject } from "react";
import { Maximize, Minimize } from "lucide-react";

interface PresentationModeButtonProps {
  targetRef: RefObject<HTMLElement | null>;
}

export default function PresentationModeButton({ targetRef }: PresentationModeButtonProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  async function toggle() {
    if (!targetRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await targetRef.current.requestFullscreen();
    }
  }

  return (
    <button
      onClick={toggle}
      className="absolute top-3 left-3 z-[1000] bg-brand-navy/90 hover:bg-brand-navy text-white rounded-lg p-2 shadow-lg"
      title={isFullscreen ? "Exit presentation mode" : "Presentation mode (fullscreen)"}
      aria-label="Toggle presentation mode"
    >
      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
    </button>
  );
}
