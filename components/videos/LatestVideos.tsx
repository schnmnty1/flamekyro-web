"use client";

import { motion } from "framer-motion";
import { VideoCard } from "@/components/videos/VideoCard";
import { GlassButton } from "@/components/ui";
import { LATEST_VIDEOS, VIDEOS_INDEX_URL } from "@/data/videos";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT, staggerContainer } from "@/lib/motion";

const sectionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/**
 * Latest Videos — cinematic upload grid below the social carousel.
 */
export function LatestVideos() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      aria-labelledby="latest-videos-heading"
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
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
        >
          <h2
            id="latest-videos-heading"
            className="text-display text-sm uppercase tracking-[0.38em] text-white/48 sm:text-base"
          >
            Latest Videos
          </h2>
          <p className="text-brand mt-3 text-sm tracking-[0.01em] text-white/45 sm:text-base">
            Latest uploads from FlameKyro
          </p>
        </motion.div>

        <motion.div
          variants={prefersReducedMotion ? undefined : staggerContainer}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7"
        >
          {LATEST_VIDEOS.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </motion.div>

        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mt-10 flex justify-center sm:mt-12"
        >
          <GlassButton
            href={VIDEOS_INDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View all FlameKyro videos on YouTube"
            className="min-h-11 px-8 text-sm tracking-[0.12em] uppercase"
          >
            View All Videos
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
