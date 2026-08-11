"use client";

import { useEffect, useState } from "react";

/**
 * Loads each image path once and turns it into a repeating
 * CanvasPattern, keyed by path. Returns an empty/partial map while
 * images are still loading — callers should fall back to a flat color
 * for any path not yet in the returned map.
 */
export function useImagePatterns(paths: string[]): Record<string, CanvasPattern> {
  const [patterns, setPatterns] = useState<Record<string, CanvasPattern>>({});
  const key = paths.slice().sort().join("|");

  useEffect(() => {
    if (paths.length === 0) return;
    let cancelled = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    paths.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        if (cancelled) return;
        const pattern = ctx.createPattern(img, "repeat");
        if (pattern) {
          setPatterns((prev) => ({ ...prev, [src]: pattern }));
        }
      };
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return patterns;
}
