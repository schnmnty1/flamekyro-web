"use client";

import { useEffect } from "react";
import { GlassButton } from "@/components/ui";
import { BRAND } from "@/lib/constants";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Route error boundary — calm recovery without breaking brand language.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-brand mb-3 text-xs uppercase tracking-[0.28em] text-white/40">
        {BRAND.name}
      </p>
      <h1 className="text-display text-3xl text-white sm:text-4xl">
        Something went wrong
      </h1>
      <p className="text-brand mt-3 max-w-md text-sm tracking-[0.02em] text-white/45">
        The page hit an unexpected error. You can try again without leaving the
        site.
      </p>
      <GlassButton
        type="button"
        onClick={reset}
        className="mt-8 min-h-10 px-7 text-sm tracking-[0.12em] uppercase"
      >
        Try Again
      </GlassButton>
    </div>
  );
}
