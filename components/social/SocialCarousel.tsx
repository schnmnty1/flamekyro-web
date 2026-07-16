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
  PERSPECTIVE_PX_MOBILE,
  SNAP_THRESHOLD_PX,
  STEP_PX,
  STEP_PX_MOBILE,
  applyArchiveCardPaint,
  paintArchiveCard,
  signedOffset,
  wrapIndex,
} from "@/components/social/archiveCoverflow";
import { SOCIAL_PLATFORMS } from "@/data/social";
import { BRAND } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/hooks";

/** Continuous auto-scroll — one card every ~2.5s (does not alter drag physics) */
const AUTO_MS_PER_CARD = 2_500;
const AUTO_RESUME_MS = 750;
/** Pointer travel below this is a click (open link); at/above starts drag */
const CLICK_MOVE_MAX_PX = 5;
const MOBILE_MQ = "(max-width: 767px)";

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
  const hitTargetRef = useRef<HTMLAnchorElement>(null);
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
  /** Hard lock while pointer is down — blocks any auto-advance until release */
  const interactionLockRef = useRef(false);
  const frozenActiveRef = useRef(0);
  const frozenOffsetRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [liteEffects, setLiteEffects] = useState(false);
  const [perspectivePx, setPerspectivePx] = useState(PERSPECTIVE_PX);
  const prefersReducedMotion = usePrefersReducedMotion();
  const activePlatform = SOCIAL_PLATFORMS[activeIndex];
  /** Coverflow pitch — desktop STEP_PX, mobile STEP_PX_MOBILE */
  const stepPxRef = useRef(STEP_PX);
  const reducedFxRef = useRef(false);

  /**
   * Flat 2D hit proxy — mirrors the front card's screen rect.
   * Keeps clicks working under preserve-3d without touching coverflow paint.
   */
  const syncHitTarget = useCallback(() => {
    const hit = hitTargetRef.current;
    const stage = stageRef.current;
    if (!hit || !stage) return;

    let frontIndex = -1;
    let frontEl: HTMLElement | null = null;
    for (let i = 0; i < length; i += 1) {
      const el = cardRefs.current[i];
      if (el?.classList.contains("is-coverflow-front")) {
        frontIndex = i;
        frontEl = el;
        break;
      }
    }

    if (!frontEl || frontIndex < 0) {
      hit.hidden = true;
      hit.removeAttribute("href");
      return;
    }

    const platform = SOCIAL_PLATFORMS[frontIndex];
    const stageRect = stage.getBoundingClientRect();
    const rect = frontEl.getBoundingClientRect();

    hit.hidden = false;
    hit.href = platform.url;
    hit.setAttribute(
      "aria-label",
      `Open ${platform.name} — ${BRAND.handle}`,
    );
    hit.style.left = `${rect.left - stageRect.left}px`;
    hit.style.top = `${rect.top - stageRect.top}px`;
    hit.style.width = `${rect.width}px`;
    hit.style.height = `${rect.height}px`;
  }, [length]);

  /** Archive renderCarousel(offsetShift) — DOM only */
  const renderCarousel = useCallback(
    (offsetShift: number) => {
      const stepPx = stepPxRef.current;
      const reducedFx = reducedFxRef.current;
      for (let i = 0; i < length; i += 1) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const offset = signedOffset(i, activeRef.current, length) + offsetShift;
        applyArchiveCardPaint(el, paintArchiveCard(offset, stepPx, reducedFx));
      }
      syncHitTarget();
    },
    [length, syncHitTarget],
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

  /** Pause + snapshot + paint — position cannot change until interaction ends */
  const freezeAtCurrentPosition = useCallback(() => {
    pauseAutoScroll();
    interactionLockRef.current = true;
    frozenActiveRef.current = activeRef.current;
    frozenOffsetRef.current = autoOffsetRef.current;
    dragOffsetRef.current = frozenOffsetRef.current;
    // Kill CSS transform transitions for the whole gesture (click or drag)
    stageRef.current?.classList.add("is-pointer-active");
    for (const el of cardRefs.current) {
      if (!el) continue;
      el.style.transition = "none";
    }
    renderCarousel(frozenOffsetRef.current);
  }, [pauseAutoScroll, renderCarousel]);

  const startAutoScroll = useCallback(() => {
    if (
      prefersReducedMotion ||
      autoPausedRef.current ||
      interactionLockRef.current
    ) {
      return;
    }
    stopAutoScroll();
    setAutoScrollingClass(true);
    autoLastTsRef.current = performance.now();

    const tick = (now: number) => {
      if (
        autoPausedRef.current ||
        draggingRef.current ||
        interactionLockRef.current
      ) {
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
      if (draggingRef.current || interactionLockRef.current) return;
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

  /** Mobile coverflow pitch + perspective — desktop constants untouched */
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      const mobile = mq.matches;
      stepPxRef.current = mobile ? STEP_PX_MOBILE : STEP_PX;
      reducedFxRef.current = mobile;
      setPerspectivePx(mobile ? PERSPECTIVE_PX_MOBILE : PERSPECTIVE_PX);
      renderCarousel(
        draggingRef.current ? dragOffsetRef.current : autoOffsetRef.current,
      );
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [renderCarousel]);

  const setActive = useCallback(
    (index: number) => {
      const next = wrapIndex(index, length);
      interactionLockRef.current = false;
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
    // Never clear a user/interaction pause when this effect re-runs
    if (!autoPausedRef.current && !interactionLockRef.current) {
      startAutoScroll();
    }
    return () => {
      // Stop the loop only — keep an in-flight 750ms resume timer intact
      if (autoRafRef.current) {
        cancelAnimationFrame(autoRafRef.current);
        autoRafRef.current = 0;
      }
      autoLastTsRef.current = 0;
      setAutoScrollingClass(false);
    };
  }, [
    prefersReducedMotion,
    pauseAutoScroll,
    startAutoScroll,
    setAutoScrollingClass,
  ]);

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

      // Freeze immediately — no further auto-advance until click/drag ends
      freezeAtCurrentPosition();

      const pointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const baseOffset = frozenOffsetRef.current;
      const baseActive = frozenActiveRef.current;
      let tracking = true;
      let didDrag = false;

      const endListeners = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      const finishInteraction = () => {
        tracking = false;
        endListeners();
        draggingRef.current = false;
        stageRef.current?.classList.remove("is-dragging");
        stageRef.current?.classList.remove("is-pointer-active");
        for (const el of cardRefs.current) {
          if (!el) continue;
          el.style.transition = "";
        }
        try {
          stageRef.current?.releasePointerCapture?.(pointerId);
        } catch {
          /* already released */
        }
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (!tracking || moveEvent.pointerId !== pointerId) return;

        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const distance = Math.hypot(dx, dy);

        // Stay frozen in click mode until movement exceeds threshold
        if (!didDrag) {
          if (distance < CLICK_MOVE_MAX_PX) return;
          didDrag = true;
          draggingRef.current = true;
          stageRef.current?.classList.add("is-dragging");
          try {
            stageRef.current?.setPointerCapture?.(pointerId);
          } catch {
            /* ignore — still apply drag math this frame */
          }
        }

        // Archive drag math: same sign as pointer (left → negative offset)
        const stepPx = stepPxRef.current;
        dragOffsetRef.current = Math.max(
          -DRAG_CLAMP,
          Math.min(DRAG_CLAMP, baseOffset + dx / stepPx),
        );
        renderCarousel(dragOffsetRef.current);
        moveEvent.preventDefault();
      };

      const onUp = (upEvent: PointerEvent) => {
        if (!tracking || upEvent.pointerId !== pointerId) return;
        const delta = upEvent.clientX - startX;
        finishInteraction();

        // Click: restore exact freeze snapshot, then resume after delay
        if (!didDrag) {
          activeRef.current = baseActive;
          autoOffsetRef.current = baseOffset;
          dragOffsetRef.current = baseOffset;
          renderCarousel(baseOffset);
          interactionLockRef.current = false;
          scheduleAutoResume();
          return;
        }

        // Drag: block the synthetic click that would open a link
        suppressClickRef.current = true;
        interactionLockRef.current = false;

        if (Math.abs(delta) < SNAP_THRESHOLD_PX) {
          autoOffsetRef.current = dragOffsetRef.current;
          commitAutoWraps();
          dragOffsetRef.current = autoOffsetRef.current;
          renderCarousel(autoOffsetRef.current);
          scheduleAutoResume();
          return;
        }

        setActive(activeRef.current + (delta < 0 ? 1 : -1));
      };

      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [
      commitAutoWraps,
      freezeAtCurrentPosition,
      renderCarousel,
      scheduleAutoResume,
      setActive,
    ],
  );

  const onWheel = useCallback(() => {
    pauseAutoScroll();
    scheduleAutoResume();
  }, [pauseAutoScroll, scheduleAutoResume]);

  // Returning to the tab/window: resume from the frozen position after 750ms
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        pauseAutoScroll();
        return;
      }
      if (interactionLockRef.current || draggingRef.current) return;
      scheduleAutoResume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
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
      className="relative z-10 overflow-x-clip pb-2 pt-0 md:pb-5 md:pt-2"
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
          className="carousel-stage relative z-10 mx-auto flex min-h-[200px] w-full max-w-[1242px] touch-pan-y items-center justify-center md:min-h-[360px] lg:min-h-[420px]"
          style={{ perspective: `${perspectivePx}px` }}
          onPointerDown={onPointerDown}
          onWheel={onWheel}
          onClickCapture={onClickCapture}
        >
          <ActiveCardGlow
            platform={activePlatform}
            lite={liteEffects || prefersReducedMotion}
          />

          <div
            className="relative h-[min(26vh,210px)] min-h-[200px] w-full md:h-[min(44vh,420px)] md:min-h-[310px]"
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

          {/* Flat hit proxy — clickable region for the front card only */}
          <a
            ref={hitTargetRef}
            className="coverflow-hit-target"
            target="_blank"
            rel="noopener noreferrer"
            hidden
            tabIndex={-1}
            aria-hidden="true"
            draggable={false}
          />

          <span className="sr-only" aria-live="polite">
            {activePlatform.name}: {activePlatform.description}
          </span>
        </div>

        <div className="mt-1.5 flex justify-center md:mt-4">
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
