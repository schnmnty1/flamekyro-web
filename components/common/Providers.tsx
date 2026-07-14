"use client";

import { MotionConfig } from "framer-motion";
import { MusicProvider } from "@/components/music";
import { CursorLight, SpatialProvider } from "@/components/spatial";
import type { WithChildren } from "@/types";

/**
 * App-wide providers — motion, spatial field, persistent music.
 */
export function Providers({ children }: WithChildren) {
  return (
    <MotionConfig reducedMotion="user">
      <SpatialProvider>
        <MusicProvider>
          {children}
          <CursorLight />
        </MusicProvider>
      </SpatialProvider>
    </MotionConfig>
  );
}
