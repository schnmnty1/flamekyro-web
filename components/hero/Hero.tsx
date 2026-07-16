"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MusicController } from "@/components/music";
import { useSpatialLayer } from "@/components/spatial";
import { useYouTubeLive } from "@/hooks/useYouTubeLive";
import { usePrefersReducedMotion } from "@/hooks";
import { BRAND } from "@/lib/constants";
import { heroContainer, heroHeading, heroItem } from "@/lib/motion";
import { cn } from "@/lib/cn";

const STATUS_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Distance from the logo’s inline-end to the Y stem, measured from the
 * live text metrics of the single <h1> (no ghost nodes / splits).
 */
function measureYStemInset(logo: HTMLElement): number | null {
  const textNode = Array.from(logo.childNodes).find(
    (node): node is Text =>
      node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()),
  );
  if (!textNode?.textContent) return null;

  const yIndex = textNode.textContent.toLowerCase().indexOf("y");
  if (yIndex < 0) return null;

  const range = document.createRange();
  range.setStart(textNode, yIndex);
  range.setEnd(textNode, yIndex + 1);

  const yRect = range.getBoundingClientRect();
  const logoRect = logo.getBoundingClientRect();
  if (yRect.width === 0) return null;

  return Math.max(0, logoRect.right - yRect.left);
}

/**
 * Cinematic hero — brand, stream status, ambient music pill.
 * Live status from existing `/api/youtube` (shared fetch, no extra polling).
 */
export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const layer = useSpatialLayer({
    rotate: prefersReducedMotion ? 0 : 2,
    translate: prefersReducedMotion ? 0 : 10,
  });
  const { isLive, statusLabel, liveTitle } = useYouTubeLive();

  const logoRef = useRef<HTMLHeadingElement>(null);
  const [yStemInset, setYStemInset] = useState<number | null>(null);

  useLayoutEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const update = () => {
      setYStemInset(measureYStemInset(logo));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(logo);

    void document.fonts?.ready.then(update);

    return () => ro.disconnect();
  }, []);

  const fadeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  const statusAnchorStyle: CSSProperties = {
    insetInlineEnd: yStemInset ?? 0,
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-20 flex items-end justify-center px-5 pb-2 pt-[max(2.25rem,calc(env(safe-area-inset-top)+1.75rem))] sm:px-8 sm:pb-2.5 sm:pt-[max(2.75rem,calc(env(safe-area-inset-top)+2.25rem))] lg:pb-3"
      style={{ perspective: 1200 }}
    >
      <motion.div
        variants={prefersReducedMotion ? undefined : heroContainer}
        initial={prefersReducedMotion ? false : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        style={{
          rotateX: layer.rotateX,
          rotateY: layer.rotateY,
          x: layer.x,
          y: layer.y,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className="flex w-full max-w-5xl flex-col items-center text-center will-change-transform"
      >
        <div className="relative w-fit max-w-full">
          <motion.h1
            ref={logoRef}
            id="hero-heading"
            variants={prefersReducedMotion ? undefined : heroHeading}
            className="text-display hero-glow max-w-full whitespace-nowrap text-[clamp(2.35rem,8.5vw,4.75rem)] leading-[0.9] text-white"
            style={{ transform: "translateZ(28px)" }}
          >
            {BRAND.name}
          </motion.h1>

          <motion.div
            variants={prefersReducedMotion ? undefined : heroItem}
            className="relative mt-3 min-h-[2.75rem] w-full sm:min-h-[3.25rem]"
            style={{ transform: "translateZ(16px)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isLive ? "live" : "offline"}
                className="absolute -top-[13px] flex w-max flex-col items-end"
                style={statusAnchorStyle}
                initial={STATUS_FADE.initial}
                animate={STATUS_FADE.animate}
                exit={STATUS_FADE.exit}
                transition={fadeTransition}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "relative -top-px inline-flex h-[7px] w-[7px] shrink-0 rounded-full",
                      isLive
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
                        : "bg-white/45 ring-1 ring-white/25",
                    )}
                    aria-hidden="true"
                  />
                  <p
                    className={cn(
                      "whitespace-nowrap text-sm font-medium tracking-[0.08em] uppercase sm:text-[0.95rem]",
                      isLive ? "text-emerald-400/90" : "text-white/50",
                    )}
                  >
                    <span className="sr-only">Stream status: </span>
                    {statusLabel}
                  </p>
                </div>

                <p
                  className={cn(
                    "text-brand mt-1.5 line-clamp-1 max-w-full text-right text-xs tracking-[0.02em] sm:text-sm",
                    isLive && liveTitle ? "text-white/45" : "invisible",
                  )}
                  aria-hidden={!isLive || !liveTitle}
                >
                  {liveTitle ?? "\u00A0"}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-2.5 sm:mt-3">
          <MusicController />
        </div>
      </motion.div>
    </section>
  );
}
