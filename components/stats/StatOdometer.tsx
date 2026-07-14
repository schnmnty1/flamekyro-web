"use client";

import { memo, useEffect, useRef } from "react";
import { STATS_ODOMETER_DURATION_MS } from "@/data/stats";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

type StatOdometerProps = {
  value: string;
  className?: string;
};

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/**
 * Premium per-digit vertical roll — only glyphs that change animate.
 */
export const StatOdometer = memo(function StatOdometer({
  value,
  className,
}: StatOdometerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const previousRef = useRef(value);
  const previous = previousRef.current;

  useEffect(() => {
    previousRef.current = value;
  }, [value]);

  const width = Math.max(previous.length, value.length);
  const prevPadded = previous.padStart(width, " ");
  const nextPadded = value.padStart(width, " ");
  const valueChanged = previous !== value;

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums", className)}
      aria-label={value}
    >
      {Array.from({ length: width }, (_, index) => {
        const nextChar = nextPadded[index] ?? " ";
        const prevChar = prevPadded[index] ?? " ";
        const changed = valueChanged && prevChar !== nextChar;

        return (
          <OdometerGlyph
            key={`d-${index}`}
            char={nextChar}
            animate={changed && !prefersReducedMotion}
          />
        );
      })}
    </span>
  );
});

type GlyphProps = {
  char: string;
  animate: boolean;
};

const OdometerGlyph = memo(function OdometerGlyph({
  char,
  animate,
}: GlyphProps) {
  if (char === " ") {
    return <span className="inline-block w-[0.25ch]" aria-hidden />;
  }

  if (!/\d/.test(char)) {
    return (
      <span className="inline-block" aria-hidden>
        {char}
      </span>
    );
  }

  const digit = Number(char);

  return (
    <span
      className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-[-0.12em]"
      aria-hidden
    >
      <span
        className="absolute left-0 top-0 flex w-full flex-col will-change-transform"
        style={{
          transform: `translate3d(0, ${-digit}em, 0)`,
          transitionProperty: "transform",
          transitionDuration: animate
            ? `${STATS_ODOMETER_DURATION_MS}ms`
            : "0ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {DIGITS.map((n) => (
          <span
            key={n}
            className="flex h-[1em] w-full items-center justify-center leading-none"
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
});
