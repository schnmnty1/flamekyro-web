"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ActiveCardGlow } from "@/components/social/ActiveCardGlow";
import { CarouselPagination } from "@/components/social/CarouselPagination";
import { SocialCard } from "@/components/social/SocialCard";
import {
  DRAG_CLAMP,
  PERSPECTIVE_PX,
  SNAP_THRESHOLD_PX,
  STEP_PX,
  applyArchiveCardPaint,
  paintArchiveCard,
  signedOffset,
  wrapIndex,
} from "@/components/social/archiveCoverflow";
import { SOCIAL_PLATFORMS } from "@/data/social";
import { usePrefersReducedMotion } from "@/hooks";

/**
 * Social carousel — archived FlameKyro v2 drag pipeline.
 *
 * Smoothness comes from (matching the archive):
 * 1. dragOffset = dx / STEP_PX
 * 2. render on every pointermove (no rAF coalesce)
 * 3. CSS transform transition always on (never transition:none during drag)
 */
export function SocialCarousel() {
  const length = SOCIAL_PLATFORMS.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(0);
  const dragOffsetRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [liteEffects, setLiteEffects] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const activePlatform = SOCIAL_PLATFORMS[activeIndex];

  /** Archive renderCarousel(offsetShift) — DOM only */
  const renderCarousel = useCallback(
    (offsetShift: number) => {
      for (let i = 0; i < length; i += 1) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const offset = signedOffset(i, activeRef.current, length) + offsetShift;
        applyArchiveCardPaint(el, paintArchiveCard(offset));
      }
    },
    [length],
  );

  const setCardRef = useCallback(
    (index: number, el: HTMLElement | null) => {
      cardRefs.current[index] = el;
      if (el && cardRefs.current.filter(Boolean).length === length) {
        renderCarousel(0);
      }
    },
    [length, renderCarousel],
  );

  useLayoutEffect(() => {
    renderCarousel(0);
  }, [renderCarousel]);

  useEffect(() => {
    const coarseMq = window.matchMedia("(pointer: coarse)");
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setLiteEffects(coarseMq.matches || !hoverMq.matches);
    };
    sync();
    coarseMq.addEventListener("change", sync);
    hoverMq.addEventListener("change", sync);
    return () => {
      coarseMq.removeEventListener("change", sync);
      hoverMq.removeEventListener("change", sync);
    };
  }, []);

  const setActive = useCallback(
    (index: number) => {
      const next = wrapIndex(index, length);
      activeRef.current = next;
      dragOffsetRef.current = 0;
      draggingRef.current = false;
      renderCarousel(0);
      setActiveIndex(next);
    },
    [length, renderCarousel],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (draggingRef.current) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeRef.current + 1);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeRef.current - 1);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setActive(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setActive(length - 1);
      }
    },
    [length, setActive],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      if (target.closest("button, [role='tab']")) return;

      // Archive pointerdown
      const startX = event.clientX;
      let dragStart: number | null = startX;
      dragOffsetRef.current = 0;
      let didDrag = false;

      stageRef.current?.setPointerCapture?.(event.pointerId);
      event.preventDefault();

      const endListeners = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      // Archive pointermove — sync write every event; use coalesced sample for latest dx
      const onMove = (moveEvent: PointerEvent) => {
        if (dragStart === null) return;
        const samples =
          typeof moveEvent.getCoalescedEvents === "function"
            ? moveEvent.getCoalescedEvents()
            : null;
        const latest =
          samples && samples.length > 0
            ? samples[samples.length - 1]
            : moveEvent;
        const dx = latest.clientX - dragStart;
        if (Math.abs(dx) > 8) {
          didDrag = true;
          draggingRef.current = true;
          stageRef.current?.classList.add("is-dragging");
        }
        dragOffsetRef.current = Math.max(
          -DRAG_CLAMP,
          Math.min(DRAG_CLAMP, dx / STEP_PX),
        );
        renderCarousel(dragOffsetRef.current);
        moveEvent.preventDefault();
      };

      // Archive pointerup
      const onUp = (upEvent: PointerEvent) => {
        if (dragStart === null) return;
        const delta = upEvent.clientX - dragStart;
        dragStart = null;
        endListeners();
        draggingRef.current = false;
        stageRef.current?.classList.remove("is-dragging");

        if (Math.abs(delta) < SNAP_THRESHOLD_PX) {
          dragOffsetRef.current = 0;
          renderCarousel(0);
          return;
        }

        if (didDrag) suppressClickRef.current = true;
        setActive(activeRef.current + (delta < 0 ? 1 : -1));
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [renderCarousel, setActive],
  );

  const onClickCapture = useCallback((event: MouseEvent) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (draggingRef.current) return;
      setActive(index);
    },
    [setActive],
  );

  return (
    <section
      aria-label="Social platforms carousel"
      className="relative z-10 overflow-x-clip pb-4 pt-1 sm:pb-5 sm:pt-2"
    >
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Social platforms"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none focus-visible:ring-2 focus-visible:ring-glow/50 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      >
        <div
          ref={stageRef}
          className="carousel-stage relative z-10 mx-auto flex min-h-[310px] w-full max-w-[1242px] touch-pan-y items-center justify-center sm:min-h-[360px] lg:min-h-[420px]"
          style={{ perspective: `${PERSPECTIVE_PX}px` }}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
        >
          <ActiveCardGlow
            platform={activePlatform}
            lite={liteEffects || prefersReducedMotion}
          />

          <div
            className="relative h-[min(44vh,420px)] min-h-[310px] w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {SOCIAL_PLATFORMS.map((platform, index) => (
              <SocialCard
                key={platform.id}
                platform={platform}
                layoutActive={index === activeIndex}
                liteEffects={liteEffects}
                onBind={(el) => setCardRef(index, el)}
                onSelect={() => goTo(index)}
              />
            ))}
          </div>

          <span className="sr-only" aria-live="polite">
            {activePlatform.name}: {activePlatform.description}
          </span>
        </div>

        <div className="mt-3 flex justify-center sm:mt-4">
          <CarouselPagination
            platforms={SOCIAL_PLATFORMS}
            activeIndex={activeIndex}
            onSelect={goTo}
          />
        </div>
      </div>
    </section>
  );
}
