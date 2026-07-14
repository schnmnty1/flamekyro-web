"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";
import { SPRING_SOFT } from "@/lib/motion";
import type { VideoItem } from "@/types/video";

type VideoCardProps = {
  video: VideoItem;
};

/**
 * Premium 16:9 video card — lazy thumbnail, glass meta, hover lift.
 */
export function VideoCard({ video }: VideoCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(20);
  const glareXSpring = useSpring(glareX, { stiffness: 220, damping: 30 });
  const glareYSpring = useSpring(glareY, { stiffness: 220, damping: 30 });
  const glare = useMotionTemplate`radial-gradient(320px circle at ${glareXSpring}% ${glareYSpring}%, rgba(255,255,255,0.22) 0%, transparent 55%)`;

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${video.title}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[22px]",
        "border border-white/[0.08] bg-white/[0.03]",
        "shadow-[0_18px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      variants={{
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -8, transition: { type: "spring", stiffness: 320, damping: 24 } }
      }
      onPointerMove={(event) => {
        if (prefersReducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        glareX.set(((event.clientX - rect.left) / rect.width) * 100);
        glareY.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
      onPointerLeave={() => {
        glareX.set(50);
        glareY.set(20);
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-surface">
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10"
        />

        {/* Duration */}
        <span className="absolute right-3 bottom-3 rounded-md border border-white/10 bg-black/65 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-white/90 backdrop-blur-md">
          {video.duration}
        </span>

        {/* Play overlay */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 left-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center",
            "rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md",
            "shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition-[box-shadow,transform,background-color] duration-300",
            "group-hover:bg-black/35 group-hover:shadow-[0_0_28px_rgba(0,245,255,0.35),0_8px_28px_rgba(0,0,0,0.35)]",
            !prefersReducedMotion && "group-hover:scale-110",
          )}
        >
          <Play className="h-5 w-5 translate-x-px fill-current" />
        </span>

        {/* Hover reflection */}
        {!prefersReducedMotion ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: glare }}
          />
        ) : null}
      </div>

      {/* Glass info */}
      <div className="relative border-t border-white/[0.06] bg-white/[0.04] px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-5">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <h3 className="text-brand line-clamp-2 text-sm font-semibold tracking-[0.01em] text-white/95 sm:text-[0.95rem]">
          {video.title}
        </h3>
        <p className="mt-2 text-xs tracking-[0.01em] text-white/45 sm:text-[0.8rem]">
          <span>{video.views} views</span>
          <span className="mx-2 text-white/25" aria-hidden="true">
            •
          </span>
          <span>{video.uploadedAt}</span>
        </p>
      </div>
    </motion.a>
  );
}
