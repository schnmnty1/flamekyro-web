"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks";
import { useSpatialLayer } from "@/components/spatial/SpatialProvider";
import { StarField } from "./StarField";

type AmbientBackgroundProps = {
  className?: string;
};

/**
 * Fixed dark-futuristic canvas — glow layer parallax, grid stays anchored.
 * Parallax and heavy glow soften under reduced motion / fine-pointer-less devices.
 */
export function AmbientBackground({ className }: AmbientBackgroundProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const background = useSpatialLayer({
    translate: prefersReducedMotion ? 0 : 6,
  });
  const glow = useSpatialLayer({
    translate: prefersReducedMotion ? 0 : 18,
  });

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Background depth plate */}
      <motion.div
        className="absolute inset-[-4%]"
        style={{ x: background.x, y: background.y }}
      >
        <div className="bg-grid absolute inset-0 opacity-[0.28]" />
      </motion.div>

      {/* Glow layer — shifts opposite / faster for depth */}
      <motion.div
        className="absolute inset-[-8%]"
        style={{ x: glow.x, y: glow.y }}
      >
        <div
          className={cn(
            "absolute left-[-18%] top-[20%] h-[55vh] w-[50vw] rounded-full bg-glow/[0.12]",
            prefersReducedMotion ? "blur-[70px]" : "blur-[110px]",
          )}
        />
        <div
          className={cn(
            "absolute bottom-[5%] right-[-12%] h-[50vh] w-[48vw] rounded-full bg-[#F59E0B]/[0.10]",
            prefersReducedMotion ? "blur-[80px]" : "blur-[120px]",
          )}
        />
        <div
          className={cn(
            "absolute left-1/2 top-[-25%] h-[45vh] w-[70vw] -translate-x-1/2 rounded-full bg-primary/[0.12]",
            prefersReducedMotion ? "blur-[90px]" : "blur-[130px]",
          )}
        />
      </motion.div>

      <StarField />

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_78%)]" />
    </div>
  );
}
