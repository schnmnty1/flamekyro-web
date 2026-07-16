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

/** Touch inertia (offset-units / ms) — desktop mouse snap unchanged */
const INERTIA_MIN_VELOCITY = 0.00085;
const INERTIA_MAX_VELOCITY = 0.0065;
/**
 * Asymptotic travel ≈ v * tau for v(t)=v0·e^(−t/tau).
 * Tuned so a normal swipe coasts ~450ms; fast swipes stretch toward 600ms.
 */
const INERTIA_TAU_MS = 120;
const INERTIA_DURATION_MIN_MS = 450;
const INERTIA_DURATION_MAX_MS = 600;
/** Cap coast distance after release — about 1.5 cards */
const INERTIA_MAX_TRAVEL = 1.5;
/** Ease-out steepness — higher = quicker settle, never overshoots */
const INERTIA_EASE_K = 4.2;

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
  const inertiaRafRef = useRef(0);
  /** Bumped to invalidate an in-flight inertia tick/finish (touch steals control) */
  const inertiaGenRef = useRef(0);

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

  const stopInertia = useCallback(() => {
    // Invalidate every prior generation: RAF ticks, finish/snap, and resume timers
    inertiaGenRef.current += 1;
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = 0;
    }
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
  }, []);

  /** Pause + snapshot + paint — position cannot change until interaction ends */
  const freezeAtCurrentPosition = useCallback(() => {
    // Interrupt momentum immediately — keep the current frame, no projected snap
    stopInertia();
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
  }, [pauseAutoScroll, renderCarousel, stopInertia]);

  const clearPointerPaintLock = useCallback(() => {
    stageRef.current?.classList.remove("is-pointer-active");
    for (const el of cardRefs.current) {
      if (!el) continue;
      el.style.transition = "";
    }
  }, []);

  const startAutoScroll = useCallback(() => {
    if (
      prefersReducedMotion ||
      autoPausedRef.current ||
      interactionLockRef.current ||
      inertiaRafRef.current
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
        interactionLockRef.current ||
        inertiaRafRef.current
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
    // Bind resume to the current inertia generation — stopInertia invalidates it
    const resumeGen = inertiaGenRef.current;
    autoResumeTimerRef.current = setTimeout(() => {
      autoResumeTimerRef.current = null;
      if (resumeGen !== inertiaGenRef.current) return;
      if (draggingRef.current || interactionLockRef.current || inertiaRafRef.current) {
        return;
      }
      autoPausedRef.current = false;
      startAutoScroll();
    }, AUTO_RESUME_MS);
  }, [prefersReducedMotion, startAutoScroll]);

  /**
   * Touch-only inertial coast after release.
   *
   * Architecture (not value tuning):
   * - Begins from the live drag offset (single source of truth).
   * - Target is always in the swipe direction — never back toward the prior card.
   * - Ease-out only interpolates start→target; snap runs after inertia completes.
   */
  const startInertia = useCallback(
    (velocityPxPerMs: number, swipeDeltaPx: number) => {
      const stepPx = stepPxRef.current;
      // Prefer measured velocity; fall back to swipe delta for direction only
      let v = velocityPxPerMs / stepPx;
      if (Math.abs(v) < INERTIA_MIN_VELOCITY) {
        // Direction from the gesture, magnitude at the minimum gate
        const dir = Math.sign(swipeDeltaPx);
        if (dir === 0) return false;
        // Too slow for coast — let the existing snap path handle it
        return false;
      }

      v = Math.max(
        -INERTIA_MAX_VELOCITY,
        Math.min(INERTIA_MAX_VELOCITY, v),
      );

      // Live drag offset owns the release frame (synced on every move)
      const start = dragOffsetRef.current;
      autoOffsetRef.current = start;

      const dir = Math.sign(v);
      if (dir === 0) return false;

      // Next resting card strictly in the swipe direction (never behind the finger)
      const nextCard =
        dir > 0
          ? Number.isInteger(start)
            ? start + 1
            : Math.ceil(start)
          : Number.isInteger(start)
            ? start - 1
            : Math.floor(start);

      const projected = start + v * INERTIA_TAU_MS;
      let target =
        dir > 0
          ? Math.ceil(projected - 1e-9)
          : Math.floor(projected + 1e-9);

      // Always at least the next card when inertia engages
      target = dir > 0 ? Math.max(target, nextCard) : Math.min(target, nextCard);

      // Cap additional travel (~1.5 cards) without reversing direction
      const maxReach = start + dir * INERTIA_MAX_TRAVEL;
      target =
        dir > 0
          ? Math.min(target, Math.floor(maxReach + 1e-9))
          : Math.max(target, Math.ceil(maxReach - 1e-9));

      // If clamp collapsed the advance, inertia has nothing to do
      if (dir > 0 ? target <= start : target >= start) return false;

      const speedNorm = Math.min(1, Math.abs(v) / INERTIA_MAX_VELOCITY);
      const duration =
        INERTIA_DURATION_MIN_MS +
        speedNorm * (INERTIA_DURATION_MAX_MS - INERTIA_DURATION_MIN_MS);
      const easeDen = 1 - Math.exp(-INERTIA_EASE_K);

      stopInertia();
      pauseAutoScroll();
      interactionLockRef.current = true;
      stageRef.current?.classList.add("is-pointer-active");
      for (const el of cardRefs.current) {
        if (!el) continue;
        el.style.transition = "none";
      }

      const gen = inertiaGenRef.current;
      const t0 = performance.now();

      const finish = () => {
        // Re-check at every step — a newer touch must win over this snap/resume
        if (gen !== inertiaGenRef.current) return;
        inertiaRafRef.current = 0;
        autoOffsetRef.current = target;
        if (gen !== inertiaGenRef.current) return;
        commitAutoWraps();
        dragOffsetRef.current = autoOffsetRef.current;
        if (gen !== inertiaGenRef.current) return;
        renderCarousel(autoOffsetRef.current);
        setActiveIndex(activeRef.current);
        if (gen !== inertiaGenRef.current) return;
        clearPointerPaintLock();
        interactionLockRef.current = false;
        scheduleAutoResume();
      };

      const tick = (now: number) => {
        if (gen !== inertiaGenRef.current) return;

        const t = Math.min(1, (now - t0) / duration);
        const e = (1 - Math.exp(-INERTIA_EASE_K * t)) / easeDen;
        // Monotonic start→target only (never toward the previous center)
        const offset = start + (target - start) * e;
        if (gen !== inertiaGenRef.current) return;
        autoOffsetRef.current = offset;
        dragOffsetRef.current = offset;
        renderCarousel(offset);

        if (gen !== inertiaGenRef.current) return;
        if (t >= 1) {
          finish();
          return;
        }
        inertiaRafRef.current = requestAnimationFrame(tick);
      };

      inertiaRafRef.current = requestAnimationFrame(tick);
      return true;
    },
    [
      clearPointerPaintLock,
      commitAutoWraps,
      pauseAutoScroll,
      renderCarousel,
      scheduleAutoResume,
      stopInertia,
    ],
  );

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

  // Glow / layoutActive follows activeIndex — never overwrite the live offset
  // while the finger or inertia owns the animation.
  useLayoutEffect(() => {
    if (draggingRef.current || inertiaRafRef.current || interactionLockRef.current) {
      return;
    }
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
      stopInertia();
      interactionLockRef.current = false;
      activeRef.current = next;
      dragOffsetRef.current = 0;
      autoOffsetRef.current = 0;
      draggingRef.current = false;
      pauseAutoScroll();
      clearPointerPaintLock();
      renderCarousel(0);
      setActiveIndex(next);
      scheduleAutoResume();
    },
    [
      clearPointerPaintLock,
      length,
      pauseAutoScroll,
      renderCarousel,
      scheduleAutoResume,
      stopInertia,
    ],
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
      if (inertiaRafRef.current) {
        cancelAnimationFrame(inertiaRafRef.current);
        inertiaRafRef.current = 0;
      }
      inertiaGenRef.current += 1;
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
      const isTouchPointer =
        event.pointerType === "touch" || event.pointerType === "pen";
      let tracking = true;
      let didDrag = false;
      let lastX = startX;
      let lastT = performance.now();
      let velocityX = 0;

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
        clearPointerPaintLock();
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
        const now = performance.now();
        const sampleDt = now - lastT;
        if (sampleDt > 0) {
          const instant = (moveEvent.clientX - lastX) / sampleDt;
          velocityX = velocityX * 0.68 + instant * 0.32;
        }
        lastX = moveEvent.clientX;
        lastT = now;

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
        // Finger owns both refs — one animation source while down.
        const stepPx = stepPxRef.current;
        const nextOffset = Math.max(
          -DRAG_CLAMP,
          Math.min(DRAG_CLAMP, baseOffset + dx / stepPx),
        );
        dragOffsetRef.current = nextOffset;
        autoOffsetRef.current = nextOffset;
        renderCarousel(nextOffset);
        moveEvent.preventDefault();
      };

      const onUp = (upEvent: PointerEvent) => {
        if (!tracking || upEvent.pointerId !== pointerId) return;
        const delta = upEvent.clientX - startX;

        // If the finger paused before release, drop velocity (direction kept via delta in snap)
        const idle = performance.now() - lastT;
        if (idle > 80) velocityX = 0;

        // Click: restore exact freeze snapshot, then resume after delay
        if (!didDrag) {
          finishInteraction();
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

        // Touch inertia — desktop mouse keeps the existing snap path
        if (isTouchPointer && !prefersReducedMotion) {
          tracking = false;
          endListeners();
          draggingRef.current = false;
          stageRef.current?.classList.remove("is-dragging");
          try {
            stageRef.current?.releasePointerCapture?.(pointerId);
          } catch {
            /* already released */
          }

          // Release begins from the live drag offset — do not clear paint lock yet
          autoOffsetRef.current = dragOffsetRef.current;
          if (startInertia(velocityX, delta)) return;

          // Inertia skipped (low velocity) — existing snap, transitions still off
          if (Math.abs(delta) < SNAP_THRESHOLD_PX) {
            commitAutoWraps();
            dragOffsetRef.current = autoOffsetRef.current;
            renderCarousel(autoOffsetRef.current);
            setActiveIndex(activeRef.current);
            clearPointerPaintLock();
            interactionLockRef.current = false;
            scheduleAutoResume();
            return;
          }
          setActive(activeRef.current + (delta < 0 ? 1 : -1));
          return;
        }

        finishInteraction();
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
      clearPointerPaintLock,
      commitAutoWraps,
      freezeAtCurrentPosition,
      prefersReducedMotion,
      renderCarousel,
      scheduleAutoResume,
      setActive,
      startInertia,
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
      if (draggingRef.current || inertiaRafRef.current) return;
      setActive(index);
    },
    [setActive],
  );

  return (
    <section
      aria-label="Social platforms carousel"
      className="relative z-10 overflow-x-clip pb-2 pt-4 md:pb-5 md:pt-2"
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
