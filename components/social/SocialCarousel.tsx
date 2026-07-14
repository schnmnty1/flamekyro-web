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
import { ActiveCardGlow } from "@/components/social/ActiveCardGlow";
import { CarouselInfo } from "@/components/social/CarouselInfo";
import { CarouselPagination } from "@/components/social/CarouselPagination";
import { SocialCard } from "@/components/social/SocialCard";
import {
  COVERFLOW_SPRING,
  DRAG_RELEASE_SPRING,
} from "@/components/social/cardThemes";
import { useSpatialLayer } from "@/components/spatial";
import { SOCIAL_PLATFORMS } from "@/data/social";
import { usePrefersReducedMotion, useSocialCarousel } from "@/hooks";

const DRAG_THRESHOLD_PX = 48;
const VELOCITY_STEP = 720;
const VISIBLE_RANGE = 2;

/**
 * Premium 3D social coverflow — physical drag, cinematic cards, active glow.
 */
export function SocialCarousel() {
  const labelId = useId();
  const stageRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const dragX = useMotionValue(0);
  const [isCompact, setIsCompact] = useState(false);
  const [liteEffects, setLiteEffects] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { activeIndex, goTo, next, prev, offsets } = useSocialCarousel({
    length: SOCIAL_PLATFORMS.length,
  });

  const spatial = useSpatialLayer({
    rotate: liteEffects || prefersReducedMotion ? 0 : 1.15,
    translate: liteEffects || prefersReducedMotion ? 0 : 8,
  });

  const activePlatform = SOCIAL_PLATFORMS[activeIndex];

  useEffect(() => {
    const compactMq = window.matchMedia("(max-width: 767px)");
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");

    const sync = () => {
      setIsCompact(compactMq.matches);
      setLiteEffects(coarseMq.matches || !hoverMq.matches);
    };
    sync();
    compactMq.addEventListener("change", sync);
    coarseMq.addEventListener("change", sync);
    hoverMq.addEventListener("change", sync);
    return () => {
      compactMq.removeEventListener("change", sync);
      coarseMq.removeEventListener("change", sync);
      hoverMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const root = regionRef.current;
    if (!root) return;
    const activeEl = document.activeElement;
    if (!activeEl || !root.contains(activeEl)) return;
    if (activeEl.getAttribute("role") === "tab") return;

    const activeCard = root.querySelector<HTMLElement>(`[aria-current="true"]`);
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
      const distanceSteps = Math.round(Math.abs(offsetX) / 140);
      const velocitySteps = Math.round(Math.abs(velocityX) / VELOCITY_STEP);
      const steps = Math.min(
        2,
        Math.max(
          Math.abs(offsetX) > DRAG_THRESHOLD_PX || Math.abs(velocityX) > 420
            ? 1
            : 0,
          distanceSteps + (Math.abs(velocityX) > 420 ? velocitySteps : 0),
        ),
      );

      if (steps > 0) {
        suppressClickRef.current = true;
        const forward = offsetX < 0 || velocityX < -420;
        for (let i = 0; i < steps; i += 1) {
          if (forward) next();
          else prev();
        }
      }

      void animate(dragX, 0, {
        ...DRAG_RELEASE_SPRING,
        velocity: velocityX * 0.12,
      });
    },
    [dragX, next, prev],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
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

        if (isHorizontal === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
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
        // Physical feel — slight rubber-band past edges of a single step
        const resisted = Math.tanh(dx / 280) * 180;
        dragX.set(resisted);
      };

      const onUp = (upEvent: PointerEvent) => {
        tracking = false;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);

        if (!decided || !isHorizontal) {
          void animate(dragX, 0, COVERFLOW_SPRING);
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
          className="text-display text-sm uppercase tracking-[0.38em] text-white/48 sm:text-base"
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
          className="relative z-10 mx-auto h-[280px] w-full max-w-6xl touch-pan-y sm:h-[360px] lg:h-[400px]"
          style={{ perspective: isCompact ? 1200 : 1700 }}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
        >
          <ActiveCardGlow
            platform={activePlatform}
            lite={liteEffects || prefersReducedMotion}
          />

          <motion.div
            className="relative h-full w-full will-change-transform"
            style={{
              x: dragX,
              rotateX: spatial.rotateX,
              rotateY: spatial.rotateY,
              y: spatial.y,
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
                  liteEffects={liteEffects}
                  onSelect={() => goTo(index)}
                />
              ))}
            </div>
          </motion.div>

          <span className="sr-only" aria-live="polite">
            {activePlatform.name}: {activePlatform.description}
          </span>
        </div>

        <div className="mt-8 flex flex-col items-center gap-7 sm:mt-10 sm:gap-8">
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
