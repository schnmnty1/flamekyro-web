"use client";

import { motion } from "framer-motion";
import { useSpatial, useSpatialLayer } from "@/components/spatial/SpatialProvider";

/**
 * Soft cursor-following light — depth layer only, not a custom cursor.
 */
export function CursorLight() {
  const { enabled } = useSpatial();
  const { x, y } = useSpatialLayer({ translate: 28 });

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-1/2 left-1/2 z-[5] h-[42vmin] w-[42vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        x,
        y,
        background:
          "radial-gradient(circle, color-mix(in srgb, var(--glow) 10%, transparent) 0%, transparent 68%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
