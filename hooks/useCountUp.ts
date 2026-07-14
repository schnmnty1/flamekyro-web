"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks";

type UseCountUpOptions = {
  value: number;
  enabled?: boolean;
  durationMs?: number;
};

/**
 * GPU-friendly counter via rAF — no Framer re-renders per frame beyond one state tick.
 */
export function useCountUp({
  value,
  enabled = true,
  durationMs = 1200,
}: UseCountUpOptions): number {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(enabled ? 0 : value);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }

    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = valueRef.current;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, enabled, durationMs, prefersReducedMotion]);

  return display;
}
