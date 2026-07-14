"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { CarouselInfo } from "@/components/social/CarouselInfo";
import { CarouselPagination } from "@/components/social/CarouselPagination";
import { SocialCard } from "@/components/social/SocialCard";
import { SOCIAL_PLATFORMS } from "@/data/social";
import { useSocialCarousel } from "@/hooks";
import { CAROUSEL_SPRING } from "@/lib/motion";

const DRAG_THRESHOLD_PX = 56;
const VISIBLE_RANGE = 2;

/**
 * Signature 3D social coverflow — infinite, drag/swipe + keyboard driven.
 * Does not own audio or cursor behavior.
 */
export function SocialCarousel() {
  const labelId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const dragX = useMotionValue(0);
  const [isCompact, setIsCompact] = useState(false);

  const { activeIndex, goTo, next, prev, offsets } = useSocialCarousel({
    length: SOCIAL_PLATFORMS.length,
  });

  const activePlatform = SOCIAL_PLATFORMS[activeIndex];

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsCompact(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  // Keep keyboard focus on the active card when arrows change selection.
  useEffect(() => {
    const root = regionRef.current;
    if (!root) return;
    const activeEl = document.activeElement;
    if (!activeEl || !root.contains(activeEl)) return;
    if (activeEl.getAttribute("role") === "tab") return;

    const activeCard = root.querySelector<HTMLElement>(
      `[aria-current="true"]`,
    );
    activeCard?.focus({ preventScroll: true });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        next();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        prev();
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        goTo(SOCIAL_PLATFORMS.length - 1);
      }
    },
    [goTo, next, prev],
  );

  const settleDrag = useCallback(
    (offsetX: number, velocityX: number) => {
      const flicked = Math.abs(velocityX) > 450;
      const dragged = Math.abs(offsetX) > DRAG_THRESHOLD_PX;

      if (flicked || dragged) {
        suppressClickRef.current = true;
        if (offsetX < 0 || velocityX < -450) next();
        else prev();
      }

      void animate(dragX, 0, CAROUSEL_SPRING);
    },
    [dragX, next, prev],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      // Pagination / explicit buttons stay click-only
      if (target.closest("button, [role='tab']")) return;

      const startX = event.clientX;
      const startY = event.clientY;
      let lastX = startX;
      let lastT = performance.now();
      let velocityX = 0;
      let tracking = true;
      let decided = false;
      let isHorizontal: boolean | null = null;

      const onMove = (moveEvent: PointerEvent) => {
        if (!tracking) return;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (isHorizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          isHorizontal = Math.abs(dx) >= Math.abs(dy);
          if (!isHorizontal) {
            tracking = false;
            dragX.set(0);
            return;
          }
          decided = true;
          stageRef.current?.setPointerCapture(moveEvent.pointerId);
        }

        if (!isHorizontal) return;

        moveEvent.preventDefault();
        const now = performance.now();
        const dt = Math.max(now - lastT, 1);
        velocityX = ((moveEvent.clientX - lastX) / dt) * 1000;
        lastX = moveEvent.clientX;
        lastT = now;
        dragX.set(dx * 0.55);
      };

      const onUp = (upEvent: PointerEvent) => {
        tracking = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        if (!decided || !isHorizontal) {
          dragX.set(0);
          return;
        }

        settleDrag(upEvent.clientX - startX, velocityX);
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [dragX, settleDrag],
  );

  const onClickCapture = useCallback((event: React.MouseEvent) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  return (
    <section
      aria-labelledby={labelId}
      className="relative z-10 overflow-x-clip pb-16 pt-2 sm:pb-24 sm:pt-3"
    >
      <div className="container-page mb-4 text-center sm:mb-5">
        <h2
          id={labelId}
          className="text-display text-sm tracking-[0.35em] text-white/55 sm:text-base"
        >
          Connect
        </h2>
      </div>

      <div
        ref={regionRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Social platforms carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <div
          ref={stageRef}
          className="relative mx-auto h-[280px] w-full max-w-6xl touch-pan-y sm:h-[360px] lg:h-[400px]"
          style={{ perspective: isCompact ? 900 : 1400 }}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
        >
          <motion.div
            className="relative h-full w-full"
            style={{
              x: dragX,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
            >
              {SOCIAL_PLATFORMS.map((platform, index) => (
                <SocialCard
                  key={platform.id}
                  platform={platform}
                  offset={offsets[index] ?? 0}
                  isActive={index === activeIndex}
                  visibleRange={VISIBLE_RANGE}
                  isCompact={isCompact}
                  onSelect={() => goTo(index)}
                />
              ))}
            </div>
          </motion.div>

          <span className="sr-only" aria-live="polite">
            {activePlatform.name}: {activePlatform.description}
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-8 sm:mt-10">
          <CarouselPagination
            platforms={SOCIAL_PLATFORMS}
            activeIndex={activeIndex}
            onSelect={goTo}
          />
          <CarouselInfo platform={activePlatform} />
        </div>
      </div>
    </section>
  );
}
