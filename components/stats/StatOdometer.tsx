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
 * "749.3K" as one typographic unit — tabular nums, shared baseline.
 * Digits may roll; suffixes stay in the same text run.
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

  if (prefersReducedMotion) {
    return (
      <span
        className={cn("text-metric whitespace-nowrap leading-none", className)}
        aria-label={value}
      >
        {value}
      </span>
    );
  }

  const width = Math.max(previous.length, value.length);
  const prevPadded = previous.padStart(width, " ");
  const nextPadded = value.padStart(width, " ");
  const valueChanged = previous !== value;

  return (
    <span
      className={cn("text-metric whitespace-nowrap leading-none", className)}
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
            animate={changed}
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
    return <span aria-hidden>{char}</span>;
  }

  const digit = Number(char);

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{
        width: "1ch",
        height: "1em",
        lineHeight: 1,
        verticalAlign: "baseline",
        fontVariantNumeric: "tabular-nums",
      }}
      aria-hidden
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: "1ch",
          height: "1em",
          lineHeight: 1,
          visibility: "hidden",
        }}
      >
        0
      </span>
      <span
        className="will-change-transform"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          lineHeight: 1,
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
            style={{
              display: "block",
              width: "100%",
              height: "1em",
              lineHeight: 1,
            }}
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
});
