"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { SPRING_SOFT } from "@/lib/motion";
import type { AboutBadge } from "@/types/about";

type InfoBadgeProps = {
  badge: AboutBadge;
  className?: string;
};

/**
 * Premium glass fact chip — label + value pills.
 */
export function InfoBadge({ badge, className }: InfoBadgeProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: SPRING_SOFT,
        },
      }}
      className={cn(
        "glass-panel rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4",
        className,
      )}
    >
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-white/40">
        {badge.label}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {badge.values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-sm tracking-[0.01em] text-white/88"
          >
            {value}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
