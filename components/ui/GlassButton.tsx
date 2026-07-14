"use client";

import { forwardRef, type ReactNode, type Ref } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { buttonHover, buttonTap } from "@/lib/motion";

type SharedProps = {
  children: ReactNode;
  className?: string;
  /** Soft cyan glow on hover */
  glow?: boolean;
  "aria-label"?: string;
};

type GlassButtonAsButton = SharedProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

type GlassButtonAsLink = SharedProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: undefined;
  disabled?: undefined;
};

export type GlassButtonProps = GlassButtonAsButton | GlassButtonAsLink;

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 " +
  "bg-white/[0.06] px-4 py-2 text-sm font-medium tracking-wide text-white/90 " +
  "backdrop-blur-md transition-[box-shadow,background-color,border-color,color] " +
  "duration-300 hover:border-glow/30 hover:bg-white/[0.10] hover:text-white " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/60 " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background " +
  "disabled:pointer-events-none disabled:opacity-50";

/**
 * Rounded glassmorphism control — used in Navbar and Hero CTAs.
 */
export const GlassButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  GlassButtonProps
>(function GlassButton(
  { children, className, glow = true, "aria-label": ariaLabel, ...props },
  ref,
) {
  const classes = cn(
    baseClass,
    glow && "hover:shadow-[0_0_24px_rgba(0,245,255,0.18)]",
    className,
  );

  if ("href" in props && props.href) {
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        href={props.href}
        target={props.target}
        rel={props.rel}
        aria-label={ariaLabel}
        className={classes}
        whileHover={buttonHover}
        whileTap={buttonTap}
      >
        {children}
      </motion.a>
    );
  }

  const buttonProps = props as GlassButtonAsButton;
  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      aria-label={ariaLabel}
      className={classes}
      whileHover={buttonHover}
      whileTap={buttonTap}
    >
      {children}
    </motion.button>
  );
});
