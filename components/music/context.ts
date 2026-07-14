"use client";

import { createContext, useContext } from "react";
import type { MusicContextValue } from "@/types/music";

export const MusicContext = createContext<MusicContextValue | null>(null);

export function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) {
    throw new Error("useMusic must be used within MusicProvider");
  }
  return ctx;
}
