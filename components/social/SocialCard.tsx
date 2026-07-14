"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { SocialIcon } from "@/components/social/SocialIcon";
import { PLATFORM_CARD_THEMES } from "@/components/social/cardThemes";
import { BRAND } from "@/lib/constants";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";
import type { SocialPlatform } from "@/types/social";

export type SocialCardProps = {
  platform: SocialPlatform;
  layoutActive: boolean;
  liteEffects: boolean;
  onBind: (el: HTMLElement | null) => void;
  onSelect: () => void;
};

/**
 * Platform badge card — icon only.
 * Host receives transform (compositor); .coverflow-fx-layer receives filter/opacity.
 */
export function SocialCard({
  platform,
  layoutActive,
  liteEffects,
  onBind,
  onSelect,
}: SocialCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = PLATFORM_CARD_THEMES[platform.icon];
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [hovered, setHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 24 });

  useLayoutEffect(() => {
    onBind(linkRef.current);
    return () => onBind(null);
  }, [onBind]);

  const enableHoverFX =
    layoutActive && !liteEffects && !prefersReducedMotion;

  return (
    <a
      ref={linkRef}
      href={platform.url}
      target="_blank"
      rel="noopener noreferrer"
      draggable={false}
      tabIndex={layoutActive ? 0 : -1}
      aria-label={`Open ${platform.name} — ${BRAND.handle}`}
      aria-current={layoutActive ? "true" : undefined}
      onClick={(event) => {
        if (!layoutActive) {
          event.preventDefault();
          onSelect();
        }
      }}
      onKeyDown={(event) => {
        if (!layoutActive && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => {
        if (enableHoverFX) setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setGlare({ x: 50, y: 24 });
      }}
      onMouseMove={(event) => {
        if (!enableHoverFX) return;
        if (event.currentTarget.closest(".carousel-stage.is-dragging")) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setGlare({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
      className={cn(
        "social-coverflow-card absolute top-1/2 left-1/2 overflow-hidden will-change-transform",
        "w-[clamp(150px,21vw,250px)] aspect-square",
        "rounded-[28px] border sm:rounded-[32px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/65 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      style={{
        transformStyle: "preserve-3d",
        background: theme.surface,
        boxShadow: layoutActive
          ? [
              `0 36px 70px rgba(0,0,0,0.55)`,
              `0 0 56px ${theme.shadow}`,
              `inset 0 1px 0 rgba(255,255,255,0.35)`,
              `inset 0 -1px 0 rgba(0,0,0,0.2)`,
            ].join(", ")
          : [
              `0 22px 48px rgba(0,0,0,0.42)`,
              `0 0 24px ${theme.shadow}`,
              `inset 0 1px 0 rgba(255,255,255,0.22)`,
              `inset 0 -1px 0 rgba(0,0,0,0.15)`,
            ].join(", "),
      }}
    >
      <div className="coverflow-fx-layer">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: theme.wash, opacity: layoutActive ? 1 : 0.85 }}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-white/25 via-white/[0.06] to-transparent"
        />

        {enableHoverFX ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 mix-blend-soft-light"
            style={{
              background: `radial-gradient(480px circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.1) 30%, transparent 58%)`,
              opacity: hovered ? 1 : 0.5,
            }}
          />
        ) : null}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/55 to-transparent"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black/50 via-black/15 to-transparent"
        />

        <SocialIcon
          id={platform.icon}
          className="coverflow-float icon-crisp relative z-[1] aspect-square h-[65%] w-[65%] shrink-0 drop-shadow-[0_10px_22px_rgba(0,0,0,0.32)]"
          style={{ color: theme.accent }}
        />
      </div>
    </a>
  );
}
