"use client";

import { MotionConfig } from "framer-motion";
import type { WithChildren } from "@/types";

/**
 * App-wide animation context.
 * `reducedMotion="user"` defers to prefers-reduced-motion automatically.
 */
export function Providers({ children }: WithChildren) {
  return (
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  );
}
