"use client";

import { motion } from "framer-motion";
import { InfoBadge } from "@/components/about/InfoBadge";
import { PortraitFrame } from "@/components/about/PortraitFrame";
import { GlassButton } from "@/components/ui";
import { ABOUT_PROFILE } from "@/data/about";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

const sectionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

const badgeContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/**
 * About FlameKyro — creator profile with portrait, badges, and bio.
 */
export function AboutSection() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { heading, subtitle, bio, badges, setupHref } = ABOUT_PROFILE;

  return (
    <section
      aria-labelledby="about-heading"
      className="relative z-10 overflow-x-clip pb-20 pt-6 sm:pb-28 sm:pt-10"
    >
      <motion.div
        className="container-page"
        variants={prefersReducedMotion ? undefined : sectionContainer}
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
        >
          <h2
            id="about-heading"
            className="text-display text-sm uppercase tracking-[0.38em] text-white/48 sm:text-base"
          >
            {heading}
          </h2>
          <p className="text-brand mt-3 text-sm tracking-[0.01em] text-white/45 sm:text-base">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 xl:gap-16">
          <PortraitFrame />

          <div className="flex flex-col gap-6 sm:gap-7">
            <motion.div
              variants={prefersReducedMotion ? undefined : badgeContainer}
              className="grid gap-3 sm:grid-cols-2 sm:gap-4"
            >
              {badges.map((badge) => (
                <InfoBadge key={badge.id} badge={badge} />
              ))}
            </motion.div>

            <motion.p
              variants={prefersReducedMotion ? undefined : sectionItem}
              className="text-body max-w-xl text-sm leading-relaxed tracking-[-0.01em] text-white/55 sm:text-base sm:leading-relaxed"
            >
              {bio}
            </motion.p>

            <motion.div variants={prefersReducedMotion ? undefined : sectionItem}>
              <GlassButton
                href={setupHref}
                aria-label="View FlameKyro gaming setup"
                className="min-h-11 px-7 text-sm tracking-[0.12em] uppercase"
              >
                View My Gaming Setup
              </GlassButton>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
