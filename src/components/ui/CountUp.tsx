"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** The final display value, e.g. "3200 m" or "42" or "—". */
  value: string;
  duration?: number;
}

/**
 * Animates the leading number in `value` from 0 up to its final
 * figure, keeping any surrounding text (units, suffixes) intact.
 * Non-numeric values (like "—") just render as-is, no animation.
 */
export default function CountUp({ value, duration = 800 }: CountUpProps) {
  const match = value.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  const [display, setDisplay] = useState(match ? "0" + match[2] : value);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!match) {
      setDisplay(value);
      return;
    }
    const target = parseFloat(match[1]);
    const suffix = match[2];
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      setDisplay(`${Number.isInteger(target) ? Math.round(current) : current.toFixed(1)}${suffix}`);
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}
