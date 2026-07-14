"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks";

type Star = {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
};

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
};

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

/**
 * Tiny stars + soft floating dust.
 * Deterministic positions — no layout thrash on re-render.
 */
export function StarField() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const stars = useMemo<Star[]>(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const r = seededRandom(i + 1);
        const r2 = seededRandom(i + 50);
        const r3 = seededRandom(i + 90);
        return {
          id: i,
          left: `${r * 100}%`,
          top: `${r2 * 100}%`,
          size: 0.8 + r3 * 1.4,
          opacity: 0.15 + r * 0.45,
          delay: r2 * 4,
          duration: 3 + r3 * 4,
        };
      }),
    [],
  );

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const r = seededRandom(i + 200);
        const r2 = seededRandom(i + 260);
        const r3 = seededRandom(i + 320);
        return {
          id: i,
          left: `${10 + r * 80}%`,
          top: `${15 + r2 * 70}%`,
          size: 1.5 + r3 * 2,
          opacity: 0.12 + r * 0.2,
          driftX: (r - 0.5) * 24,
          driftY: -12 - r2 * 28,
          duration: 10 + r3 * 10,
          delay: r * 5,
        };
      }),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.span
          key={`star-${star.id}`}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : { opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4] }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: star.duration,
                  delay: star.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}

      {particles.map((p) => (
        <motion.span
          key={`particle-${p.id}`}
          className="absolute rounded-full bg-glow/80"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            filter: "blur(0.5px)",
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, p.driftX, 0],
                  y: [0, p.driftY, 0],
                  opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />
      ))}
    </div>
  );
}
