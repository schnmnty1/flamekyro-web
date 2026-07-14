import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion primitives — import these instead of inventing per-component timings.
 * Respects reduced-motion via Framer's ReducedMotionConfig in Providers.
 */

export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];

export const DEFAULT_TRANSITION: Transition = {
  duration: 0.5,
  ease: EASE_OUT_EXPO,
};

export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
};

export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

/** Coverflow card settle — slightly snappier than section fades */
export const CAROUSEL_SPRING: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 22,
  mass: 0.75,
};

/** Navbar entrance — slides down from top */
export const navSlideDown: Variants = {
  hidden: { opacity: 0, y: -28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/** Hero container stagger */
export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

/** Hero child fade-up */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/** Heading scale-in */
export const heroHeading: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 18,
      mass: 0.9,
    },
  },
};

/** Soft button hover spring — restrained for premium feel */
export const buttonHover = {
  scale: 1.02,
  transition: {
    type: "spring" as const,
    stiffness: 420,
    damping: 32,
  },
};

export const buttonTap = {
  scale: 0.985,
};

/** Fade + slight rise — use for section entrances */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: DEFAULT_TRANSITION,
  },
};

/** Soft opacity only — use for overlays / ambient layers */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Stagger children — wrap a parent with these variants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
