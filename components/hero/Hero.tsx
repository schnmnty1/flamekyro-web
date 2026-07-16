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

const MOBILE_MQ = "(max-width: 767px)";

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
 * Mobile (<768px) uses a tighter, centered composition; desktop is unchanged.
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
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const logo = logoRef.current;
    const mq = window.matchMedia(MOBILE_MQ);

    const update = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile || !logo) {
        setYStemInset(null);
        return;
      }
      setYStemInset(measureYStemInset(logo));
    };

    update();

    const ro = logo ? new ResizeObserver(update) : null;
    if (logo) ro?.observe(logo);
    mq.addEventListener("change", update);
    void document.fonts?.ready.then(update);

    return () => {
      ro?.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  const fadeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

  /** Desktop only — Y-stem dock. Mobile centers under the logo. */
  const statusAnchorStyle: CSSProperties | undefined = isMobile
    ? undefined
    : { insetInlineEnd: yStemInset ?? 0 };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative z-20 flex items-end justify-center px-5 pb-0 pt-[max(1.15rem,calc(env(safe-area-inset-top)+0.65rem))] sm:px-8 md:pb-2.5 md:pt-[max(2.75rem,calc(env(safe-area-inset-top)+2.25rem))] lg:pb-3"
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
            className="text-display hero-glow max-w-full whitespace-nowrap text-[clamp(1.93rem,7vw,3.9rem)] leading-[0.9] text-white md:text-[clamp(2.35rem,8.5vw,4.75rem)]"
            style={{ transform: "translateZ(28px)" }}
          >
            {BRAND.name}
          </motion.h1>

          <motion.div
            variants={prefersReducedMotion ? undefined : heroItem}
            className="relative mt-2.5 min-h-[1.65rem] w-full md:mt-3 md:min-h-[3.25rem]"
            style={{ transform: "translateZ(16px)" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isLive ? "live" : "offline"}
                className={cn(
                  "absolute flex w-max flex-col",
                  isMobile
                    ? "top-0 left-1/2 -translate-x-1/2 items-center"
                    : "-top-[13px] items-end",
                )}
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
                    "text-brand mt-1 line-clamp-1 max-w-full text-xs tracking-[0.02em] sm:text-sm md:mt-1.5",
                    isMobile ? "text-center" : "text-right",
                    isLive && liveTitle
                      ? "text-white/45"
                      : "invisible max-md:hidden",
                  )}
                  aria-hidden={!isLive || !liveTitle}
                >
                  {liveTitle ?? "\u00A0"}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-1 md:mt-3">
          <MusicController />
        </div>
      </motion.div>
    </section>
  );
}
