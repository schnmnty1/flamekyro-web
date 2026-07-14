"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { GlassButton } from "@/components/ui";
import { useSpatialLayer } from "@/components/spatial";
import { BRAND, LINKS } from "@/lib/constants";
import { navSlideDown } from "@/lib/motion";

/**
 * Top navigation — brand left, glass actions right.
 * Minimal spatial response (≤0.5°).
 */
export function Navbar() {
  const [copied, setCopied] = useState(false);
  const layer = useSpatialLayer({ rotate: 0.45, translate: 3 });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BRAND.handle);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — fail silently; button remains usable
    }
  }, []);

  return (
    <motion.header
      variants={navSlideDown}
      initial="hidden"
      animate="visible"
      className="fixed inset-x-0 top-0 z-50"
      style={{ perspective: 1000 }}
    >
      <div className="container-page">
        <motion.nav
          aria-label="Primary"
          style={{
            rotateX: layer.rotateX,
            rotateY: layer.rotateY,
            x: layer.x,
            y: layer.y,
            transformStyle: "preserve-3d",
          }}
          className="glass-panel mt-4 flex items-center justify-between gap-4 rounded-2xl px-4 py-3 will-change-transform sm:px-5"
        >
          <a
            href="/"
            className="group flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className="relative flex h-8 w-8 items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full bg-glow/25 blur-md transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative h-3.5 w-3.5 rounded-full bg-glow shadow-[0_0_10px_rgba(0,245,255,0.75),0_0_24px_rgba(0,245,255,0.35)]" />
            </span>
            <span className="text-brand text-sm font-semibold tracking-[0.12em] text-white/95 sm:text-[0.95rem]">
              {BRAND.name}
            </span>
          </a>

          <div className="hidden flex-1 md:block" aria-hidden="true" />

          <div className="flex items-center gap-2 sm:gap-2.5">
            <GlassButton
              onClick={handleCopy}
              aria-label={
                copied
                  ? "Handle copied to clipboard"
                  : `Copy ${BRAND.handle} to clipboard`
              }
              className="min-h-10 px-3.5 text-xs sm:px-4 sm:text-sm"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="h-3.5 w-3.5 text-white/70" aria-hidden />
              )}
              <span className="sm:hidden">{copied ? "Copied!" : "Copy"}</span>
              <span className="hidden sm:inline">
                {copied ? "Copied!" : `Copy ${BRAND.handle}`}
              </span>
            </GlassButton>

            <GlassButton
              href={LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join Discord community"
              className="min-h-10 px-3.5 text-xs sm:px-4 sm:text-sm"
            >
              Join Discord
            </GlassButton>
          </div>
        </motion.nav>
      </div>
    </motion.header>
  );
}
