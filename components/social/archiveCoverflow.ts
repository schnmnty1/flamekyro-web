/**
 * FlameKyro v2 linear coverflow — exact port of archived script.js geometry.
 * Paint path split for compositor: transform on host, filter/opacity on fx layer.
 */

/** Neighbor pitch — +10px vs archive 176 for desktop composition only */
export const STEP_PX = 186;
export const DEPTH_STEP = 120;
export const ROTATE_STEP = -34;
export const SCALE_STEP = 0.08;
export const OPACITY_STEP = 0.13;
export const DRAG_CLAMP = 1.25;
export const SNAP_THRESHOLD_PX = 42;
export const PERSPECTIVE_PX = 1200;

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/**
 * Shortest signed ring offset for coverflow.
 * With an odd platform count (7), yields a balanced −3…+3 wheel:
 * three cards left, active center, three cards right.
 */
export function signedOffset(
  index: number,
  active: number,
  total: number,
): number {
  if (total <= 0) return 0;

  let offset = index - active;
  const half = Math.floor(total / 2);

  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  return offset;
}

export type ArchiveCardPaint = {
  transform: string;
  opacity: number;
  filter: string;
  zIndex: number;
  pointerEvents: "auto" | "none";
  isActive: boolean;
};

type PaintCache = {
  transform: string;
  opacity: number;
  filter: string;
  zIndex: number;
  pointerEvents: "auto" | "none";
  isActive: boolean;
};

const paintCache = new WeakMap<HTMLElement, PaintCache>();

export type ApplyPaintOptions = {
  /** @deprecated kept for API stability — full paint always (visuals locked) */
  transformOnly?: boolean;
};

export function paintArchiveCard(offset: number): ArchiveCardPaint {
  const abs = Math.abs(offset);
  const clamped = Math.min(abs, 4);
  const x = offset * STEP_PX;
  const z = -clamped * DEPTH_STEP;
  const rotate = offset * ROTATE_STEP;
  const scale = 1 - clamped * SCALE_STEP;
  const isActive = Math.abs(offset) < 0.08;

  return {
    transform: `translate(-50%, -50%) translate3d(${x}px, 0, ${z}px) rotateY(${rotate}deg) scale(${scale})`,
    opacity: abs > 4 ? 0 : 1 - clamped * OPACITY_STEP,
    filter:
      offset === 0
        ? "brightness(1)"
        : `brightness(${0.75 - clamped * 0.04}) blur(${clamped * 0.4}px)`,
    zIndex: Math.round(20 - clamped),
    pointerEvents: abs <= 1 ? "auto" : "none",
    isActive,
  };
}

function fxLayer(el: HTMLElement): HTMLElement | null {
  return el.querySelector(".coverflow-fx-layer");
}

export function applyArchiveCardPaint(
  el: HTMLElement,
  paint: ArchiveCardPaint,
  _options: ApplyPaintOptions = {},
): void {
  const prev = paintCache.get(el);

  if (!prev || prev.transform !== paint.transform) {
    el.style.transform = paint.transform;
  }
  if (!prev || prev.zIndex !== paint.zIndex) {
    el.style.zIndex = String(paint.zIndex);
  }
  if (!prev || prev.pointerEvents !== paint.pointerEvents) {
    el.style.pointerEvents = paint.pointerEvents;
  }

  const fx = fxLayer(el);
  const target = fx ?? el;
  if (!prev || prev.opacity !== paint.opacity) {
    target.style.opacity = String(paint.opacity);
  }
  if (!prev || prev.filter !== paint.filter) {
    target.style.filter = paint.filter;
  }
  if (!prev || prev.isActive !== paint.isActive) {
    el.classList.toggle("is-active", paint.isActive);
    el.classList.toggle("is-coverflow-center", paint.isActive);
  }

  paintCache.set(el, {
    transform: paint.transform,
    opacity: paint.opacity,
    filter: paint.filter,
    zIndex: paint.zIndex,
    pointerEvents: paint.pointerEvents,
    isActive: paint.isActive,
  });
}
