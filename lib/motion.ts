import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion primitives — restrained, expensive feel.
 * Respects reduced-motion via Framer's ReducedMotionConfig in Providers.
 */

export const EASE_OUT_EXPO: Transition["ease"] = [0.16, 1, 0.3, 1];

export const DEFAULT_TRANSITION: Transition = {
  duration: 0.45,
  ease: EASE_OUT_EXPO,
};

/** Crisp UI response — buttons, taps */
export const SPRING_SNAPPY: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 32,
  mass: 0.85,
};

/** Section / card entrances — settled, not floaty */
export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 24,
  mass: 0.85,
};

/** Hover lift — short travel, high confidence */
export const SPRING_LIFT: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.7,
};

/** Coverflow card settle */
export const CAROUSEL_SPRING: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
  mass: 0.72,
};

/** Navbar entrance — slides down from top */
export const navSlideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
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
      staggerChildren: 0.09,
      delayChildren: 0.1,
    },
  },
};

/** Hero child fade-up */
export const heroItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/** Heading scale-in — subtle, not theatrical */
export const heroHeading: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 22,
      mass: 0.9,
    },
  },
};

/** Soft button hover — barely there, feels expensive */
export const buttonHover = {
  scale: 1.018,
  y: -1,
  transition: SPRING_LIFT,
};

export const buttonTap = {
  scale: 0.985,
  transition: SPRING_SNAPPY,
};

/** Fade + slight rise — use for section entrances */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
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
    transition: { duration: 0.35, ease: EASE_OUT_EXPO },
  },
};

/** Stagger children — wrap a parent with these variants */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.06,
    },
  },
};
