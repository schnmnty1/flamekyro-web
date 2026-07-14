"use client";

import { motion } from "framer-motion";
import { VideoCard } from "@/components/videos/VideoCard";
import { VideoSkeleton } from "@/components/videos/VideoSkeleton";
import { GlassButton } from "@/components/ui";
import { VIDEOS_INDEX_URL, VIDEOS_SECTION } from "@/data/videos";
import { useLatestVideos } from "@/hooks/useLatestVideos";
import { usePrefersReducedMotion } from "@/hooks";
import { BRAND } from "@/lib/constants";
import { SPRING_SOFT, staggerContainer } from "@/lib/motion";

const sectionContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const sectionItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING_SOFT,
  },
};

/**
 * Latest Videos — cinematic upload grid.
 * Shows connecting skeletons until a live YouTube adapter provides real uploads.
 */
export function LatestVideos() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { videos, loading, source, error, reload } = useLatestVideos();

  const showLiveGrid =
    !loading && !error && source === "live" && videos.length > 0;
  const showEmpty =
    !loading && !error && source === "live" && videos.length === 0;
  const showError = Boolean(error) && !loading;
  const showConnecting = loading && !error;

  return (
    <section
      aria-labelledby="latest-videos-heading"
      aria-describedby={
        showError || showConnecting || showEmpty
          ? "latest-videos-status"
          : undefined
      }
      className="section-band section-rule relative z-10 overflow-x-clip"
    >
      <motion.div
        className="container-page"
        variants={prefersReducedMotion ? undefined : sectionContainer}
        initial={prefersReducedMotion ? undefined : "hidden"}
        whileInView={prefersReducedMotion ? undefined : "visible"}
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mx-auto mb-3 max-w-2xl text-center sm:mb-3.5"
        >
          <h2 id="latest-videos-heading" className="text-section">
            {VIDEOS_SECTION.heading}
          </h2>
        </motion.div>

        {showLiveGrid ? (
          <motion.div
            variants={prefersReducedMotion ? undefined : staggerContainer}
            initial={prefersReducedMotion ? false : "hidden"}
            animate={prefersReducedMotion ? undefined : "visible"}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3 lg:gap-4"
          >
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </motion.div>
        ) : showError ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <p
              id="latest-videos-status"
              className="text-center text-sm tracking-[0.04em] text-white/45"
              role="alert"
            >
              {error ?? VIDEOS_SECTION.errorLabel}
            </p>
            <GlassButton
              type="button"
              onClick={() => void reload()}
              className="min-h-10 px-6 text-sm tracking-[0.1em] uppercase"
            >
              Try Again
            </GlassButton>
          </div>
        ) : showEmpty ? (
          <p
            id="latest-videos-status"
            className="py-6 text-center text-sm tracking-[0.04em] text-white/40"
            role="status"
          >
            No videos yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-3">
            <p
              id="latest-videos-status"
              className="text-center text-sm tracking-[0.04em] text-white/40"
              role="status"
              aria-live="polite"
            >
              {VIDEOS_SECTION.connectingLabel}
            </p>
            <VideoSkeleton count={VIDEOS_SECTION.skeletonCount} />
          </div>
        )}

        <motion.div
          variants={prefersReducedMotion ? undefined : sectionItem}
          className="mt-4 flex justify-center sm:mt-5"
        >
          <GlassButton
            href={VIDEOS_INDEX_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View all ${BRAND.name} videos on YouTube`}
            className="min-h-10 px-7 text-sm tracking-[0.12em] uppercase"
          >
            View All Videos
          </GlassButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
