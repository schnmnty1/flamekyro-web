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

/** Continuous auto-scroll — one card every ~2.5s (does not alter drag physics) */
const AUTO_MS_PER_CARD = 2_500;
const AUTO_RESUME_MS = 750;

/**
 * Social carousel — archived FlameKyro v2 drag pipeline.
 *
 * Smoothness comes from (matching the archive):
 * 1. dragOffset = dx / STEP_PX
 * 2. render on every pointermove (no rAF coalesce)
 * 3. CSS transform transition always on during drag
 *
 * Auto-scroll advances the same offsetShift the drag path uses (0 → +1 per card),
 * then commits active−1 with a seamless circular wrap — no wrapper float.
 */
export function SocialCarousel() {
  const length = SOCIAL_PLATFORMS.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const activeRef = useRef(0);
  const dragOffsetRef = useRef(0);
  /** Fractional coverflow offset while auto-scrolling (0 → +1 toward previous card) */
  const autoOffsetRef = useRef(0);
  const draggingRef = useRef(false);
  const suppressClickRef = useRef(false);
  const autoPausedRef = useRef(false);
  const autoRafRef = useRef(0);
  const autoLastTsRef = useRef(0);
  const autoResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

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

  const setAutoScrollingClass = useCallback((on: boolean) => {
    stageRef.current?.classList.toggle("is-auto-scrolling", on);
  }, []);

  /**
   * Fold offset into [0, 1) while advancing active — continuous, no visual jump.
   */
  const commitAutoWraps = useCallback(() => {
    let wrapped = false;
    while (autoOffsetRef.current >= 1) {
      autoOffsetRef.current -= 1;
      activeRef.current = wrapIndex(activeRef.current - 1, length);
      wrapped = true;
    }
    while (autoOffsetRef.current < 0) {
      autoOffsetRef.current += 1;
      activeRef.current = wrapIndex(activeRef.current + 1, length);
      wrapped = true;
    }
    if (wrapped) {
      setActiveIndex(activeRef.current);
    }
  }, [length]);

  const stopAutoScroll = useCallback(() => {
    if (autoRafRef.current) {
      cancelAnimationFrame(autoRafRef.current);
      autoRafRef.current = 0;
    }
    autoLastTsRef.current = 0;
    setAutoScrollingClass(false);
  }, [setAutoScrollingClass]);

  const pauseAutoScroll = useCallback(() => {
    autoPausedRef.current = true;
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
    stopAutoScroll();
  }, [stopAutoScroll]);

  const startAutoScroll = useCallback(() => {
    if (prefersReducedMotion || autoPausedRef.current) return;
    stopAutoScroll();
    setAutoScrollingClass(true);
    autoLastTsRef.current = performance.now();

    const tick = (now: number) => {
      if (autoPausedRef.current || draggingRef.current) {
        autoRafRef.current = 0;
        autoLastTsRef.current = 0;
        setAutoScrollingClass(false);
        return;
      }

      const last = autoLastTsRef.current || now;
      const dt = Math.min(now - last, 64);
      autoLastTsRef.current = now;

      // Advance toward previous card (LEFT → RIGHT through the coverflow)
      autoOffsetRef.current += dt / AUTO_MS_PER_CARD;
      commitAutoWraps();

      dragOffsetRef.current = autoOffsetRef.current;
      renderCarousel(autoOffsetRef.current);
      autoRafRef.current = requestAnimationFrame(tick);
    };

    autoRafRef.current = requestAnimationFrame(tick);
  }, [
    commitAutoWraps,
    prefersReducedMotion,
    renderCarousel,
    setAutoScrollingClass,
    stopAutoScroll,
  ]);

  const scheduleAutoResume = useCallback(() => {
    if (prefersReducedMotion) return;
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
    }
    autoResumeTimerRef.current = setTimeout(() => {
      autoResumeTimerRef.current = null;
      if (draggingRef.current) return;
      autoPausedRef.current = false;
      startAutoScroll();
    }, AUTO_RESUME_MS);
  }, [prefersReducedMotion, startAutoScroll]);

  const setCardRef = useCallback(
    (index: number, el: HTMLElement | null) => {
      cardRefs.current[index] = el;
      if (el && cardRefs.current.filter(Boolean).length === length) {
        renderCarousel(autoOffsetRef.current);
      }
    },
    [length, renderCarousel],
  );

  useLayoutEffect(() => {
    renderCarousel(autoOffsetRef.current);
  }, [renderCarousel]);

  // Re-paint in the same frame as activeIndex updates (glow / layoutActive)
  // so React style commits cannot leave cards on a stale transform for a frame.
  useLayoutEffect(() => {
    renderCarousel(autoOffsetRef.current);
  }, [activeIndex, renderCarousel]);

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
      autoOffsetRef.current = 0;
      draggingRef.current = false;
      pauseAutoScroll();
      renderCarousel(0);
      setActiveIndex(next);
      scheduleAutoResume();
    },
    [length, pauseAutoScroll, renderCarousel, scheduleAutoResume],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      pauseAutoScroll();
      return;
    }
    autoPausedRef.current = false;
    startAutoScroll();
    return () => {
      stopAutoScroll();
      if (autoResumeTimerRef.current) {
        clearTimeout(autoResumeTimerRef.current);
        autoResumeTimerRef.current = null;
      }
    };
  }, [prefersReducedMotion, pauseAutoScroll, startAutoScroll, stopAutoScroll]);

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

      pauseAutoScroll();

      // Continue drag from the live auto-scroll offset — no snap
      const baseOffset = autoOffsetRef.current;
      const startX = event.clientX;
      let dragStart: number | null = startX;
      dragOffsetRef.current = baseOffset;
      renderCarousel(baseOffset);
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
        const dx = latest.clientX - startX;
        if (Math.abs(dx) > 8) {
          didDrag = true;
          draggingRef.current = true;
          stageRef.current?.classList.add("is-dragging");
        }
        dragOffsetRef.current = Math.max(
          -DRAG_CLAMP,
          Math.min(DRAG_CLAMP, baseOffset + dx / STEP_PX),
        );
        renderCarousel(dragOffsetRef.current);
        moveEvent.preventDefault();
      };

      // Archive pointerup
      const onUp = (upEvent: PointerEvent) => {
        if (dragStart === null) return;
        const delta = upEvent.clientX - startX;
        dragStart = null;
        endListeners();
        draggingRef.current = false;
        stageRef.current?.classList.remove("is-dragging");

        if (Math.abs(delta) < SNAP_THRESHOLD_PX) {
          // Keep exact release position — resume auto-scroll from here (no center snap)
          autoOffsetRef.current = dragOffsetRef.current;
          commitAutoWraps();
          dragOffsetRef.current = autoOffsetRef.current;
          renderCarousel(autoOffsetRef.current);
          scheduleAutoResume();
          return;
        }

        if (didDrag) suppressClickRef.current = true;
        setActive(activeRef.current + (delta < 0 ? 1 : -1));
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [
      commitAutoWraps,
      pauseAutoScroll,
      renderCarousel,
      scheduleAutoResume,
      setActive,
    ],
  );

  const onWheel = useCallback(() => {
    pauseAutoScroll();
    scheduleAutoResume();
  }, [pauseAutoScroll, scheduleAutoResume]);

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
          onWheel={onWheel}
          onClickCapture={onClickCapture}
        >
          <ActiveCardGlow
            platform={activePlatform}
            lite={liteEffects || prefersReducedMotion}
          />

          <div
            className="relative h-[min(44vh,420px)] min-h-[310px] w-full"
            style={{ transformStyle: "preserve-3d", transformOrigin: "50% 50%" }}
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
