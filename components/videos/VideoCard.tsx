"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { Play } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";
import { SPRING_LIFT, SPRING_SOFT } from "@/lib/motion";
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
  const glareY = useMotionValue(18);
  const glareXSpring = useSpring(glareX, { stiffness: 260, damping: 32 });
  const glareYSpring = useSpring(glareY, { stiffness: 260, damping: 32 });
  const glare = useMotionTemplate`radial-gradient(340px circle at ${glareXSpring}% ${glareYSpring}%, rgba(255,255,255,0.26) 0%, rgba(0,245,255,0.06) 35%, transparent 58%)`;

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${video.title}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[18px]",
        "border border-white/[0.09] bg-white/[0.028]",
        "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_20px_48px_rgba(0,0,0,0.42),0_2px_8px_rgba(0,0,0,0.22)]",
        "transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-white/[0.14]",
        "hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_28px_56px_rgba(0,0,0,0.5),0_0_40px_rgba(0,245,255,0.06)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      variants={{
        hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : { y: -6, transition: SPRING_LIFT }
      }
      onPointerMove={(event) => {
        if (prefersReducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        glareX.set(((event.clientX - rect.left) / rect.width) * 100);
        glareY.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
      onPointerLeave={() => {
        glareX.set(50);
        glareY.set(18);
      }}
    >
      {/* Thumbnail — ~25% shorter than full 16:9 */}
      <div className="relative aspect-[16/6.75] overflow-hidden bg-surface">
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={cn(
            "object-cover will-change-transform",
            "transition-[transform,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "group-hover:scale-[1.045] group-hover:brightness-[1.06]",
          )}
          loading="lazy"
        />

        {/* Edge vignette + depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-black/25"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.35)_100%)]"
        />

        {/* Duration */}
        <span className="absolute right-2.5 bottom-2.5 rounded-md border border-white/12 bg-black/55 px-1.5 py-0.5 text-[0.65rem] font-medium tracking-[0.04em] text-white/92 shadow-[0_4px_12px_rgba(0,0,0,0.35)] backdrop-blur-md">
          {video.duration}
        </span>

        {/* Play overlay */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-12 sm:w-12",
            "rounded-full border border-white/22 bg-black/48 text-white backdrop-blur-md",
            "shadow-[0_10px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.18)]",
            "transition-[box-shadow,transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "group-hover:border-white/30 group-hover:bg-black/38",
            "group-hover:shadow-[0_0_32px_rgba(0,245,255,0.28),0_10px_28px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.22)]",
            !prefersReducedMotion && "group-hover:scale-110",
          )}
        >
          <Play className="h-4 w-4 translate-x-px fill-current drop-shadow-sm" />
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
      <div className="relative border-t border-white/[0.07] bg-gradient-to-b from-white/[0.055] to-white/[0.025] px-3.5 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/28 to-transparent"
        />
        <h3 className="text-brand line-clamp-2 text-sm font-semibold leading-snug tracking-[0.01em] text-white/[0.96] sm:text-[0.9rem]">
          {video.title}
        </h3>
        <p className="mt-1 text-xs tracking-[0.02em] text-white/42 sm:text-[0.75rem]">
          <span>{video.views} views</span>
          <span className="mx-2 text-white/22" aria-hidden="true">
            ·
          </span>
          <span>{video.uploadedAt}</span>
        </p>
      </div>
    </motion.a>
  );
}
