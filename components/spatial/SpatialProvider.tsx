"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type SpatialContextValue = {
  /** Normalized pointer X (−1 … 1), spring-smoothed */
  x: MotionValue<number>;
  /** Normalized pointer Y (−1 … 1), spring-smoothed */
  y: MotionValue<number>;
  /** False on touch / reduced-motion — transforms stay at rest */
  enabled: boolean;
};

const SpatialContext = createContext<SpatialContextValue | null>(null);

const SPRING = { stiffness: 100, damping: 26, mass: 0.45 } as const;

type SpatialProviderProps = {
  children: ReactNode;
};

/**
 * Pointer-driven spatial field. Updates MotionValues + CSS vars only —
 * no React re-renders on mouse move (60fps-friendly).
 */
export function SpatialProvider({ children }: SpatialProviderProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING);
  const y = useSpring(rawY, SPRING);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => {
      const on = !reduce.matches && fineHover.matches && !coarse.matches;
      setEnabled(on);
      if (!on) {
        rawX.set(0);
        rawY.set(0);
        document.documentElement.style.setProperty("--pointer-x", "50%");
        document.documentElement.style.setProperty("--pointer-y", "42%");
      }
    };

    sync();
    reduce.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    fineHover.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
      fineHover.removeEventListener("change", sync);
    };
  }, [rawX, rawY]);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const flush = () => {
      frame = 0;
      rawX.set(nextX);
      rawY.set(nextY);
      const px = ((nextX + 1) / 2) * 100;
      const py = ((nextY + 1) / 2) * 100;
      document.documentElement.style.setProperty("--pointer-x", `${px.toFixed(2)}%`);
      document.documentElement.style.setProperty("--pointer-y", `${py.toFixed(2)}%`);
    };

    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      nextX = (event.clientX / w) * 2 - 1;
      nextY = (event.clientY / h) * 2 - 1;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enabled, rawX, rawY]);

  const value = useMemo(
    () => ({ x, y, enabled }),
    [x, y, enabled],
  );

  return (
    <SpatialContext.Provider value={value}>{children}</SpatialContext.Provider>
  );
}

export function useSpatial(): SpatialContextValue {
  const ctx = useContext(SpatialContext);
  if (!ctx) {
    throw new Error("useSpatial must be used within SpatialProvider");
  }
  return ctx;
}

export type SpatialLayerConfig = {
  /** Max rotateX/rotateY in degrees (capped at 2 site-wide) */
  rotate?: number;
  /** Max translate in px */
  translate?: number;
};

/**
 * Per-layer transforms from the shared spatial field.
 * Uses MotionValue pipelines — consumers should pass style to motion.* (no state).
 */
export function useSpatialLayer({
  rotate = 0,
  translate = 0,
}: SpatialLayerConfig) {
  const { x, y, enabled } = useSpatial();
  const rot = enabled ? Math.min(Math.abs(rotate), 2) : 0;
  const move = enabled ? translate : 0;

  const rotateX = useTransform(y, [-1, 1], [rot, -rot]);
  const rotateY = useTransform(x, [-1, 1], [-rot, rot]);
  const tx = useTransform(x, [-1, 1], [-move, move]);
  const ty = useTransform(y, [-1, 1], [-move, move]);
  const transform = useMotionTemplate`translate3d(${tx}px, ${ty}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  return { rotateX, rotateY, x: tx, y: ty, transform, enabled };
}
