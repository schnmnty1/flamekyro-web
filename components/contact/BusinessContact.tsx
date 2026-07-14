"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { GlassButton } from "@/components/ui";
import { BUSINESS_CONTACT } from "@/data/contact";
import { usePrefersReducedMotion } from "@/hooks";
import { SPRING_SOFT } from "@/lib/motion";

const TOAST_MS = 1800;

/**
 * Minimal business contact band — glass language, copy + mailto only.
 */
export function BusinessContact() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(BUSINESS_CONTACT.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <section
      aria-labelledby="business-contact-heading"
      className="section-band section-rule relative z-10 overflow-x-clip pb-5 sm:pb-6"
    >
      <div className="container-page mx-auto flex max-w-xl flex-col items-center text-center">
        <h2 id="business-contact-heading" className="text-section">
          {BUSINESS_CONTACT.heading}
        </h2>

        <p className="text-section-sub mt-2 max-w-md text-white/42">
          {BUSINESS_CONTACT.body}
        </p>

        <a
          href={`mailto:${BUSINESS_CONTACT.email}`}
          className="text-brand mt-4 text-base font-semibold tracking-[0.035em] text-white/[0.9] underline-offset-[5px] transition-[color,text-decoration-color] duration-300 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:text-lg sm:tracking-[0.04em]"
        >
          {BUSINESS_CONTACT.email}
        </a>

        <GlassButton
          type="button"
          onClick={() => void handleCopy()}
          aria-label={
            copied
              ? "Email copied to clipboard"
              : `Copy ${BUSINESS_CONTACT.email} to clipboard`
          }
          className="mt-3.5 min-h-10 px-5 text-xs tracking-[0.1em] uppercase sm:text-sm"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5 text-white/70" aria-hidden />
          )}
          {copied ? "Copied" : "Copy Email"}
        </GlassButton>
      </div>

      <AnimatePresence>
        {copied ? (
          <motion.div
            key="copy-toast"
            role="status"
            aria-live="polite"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 6, scale: 0.98 }
            }
            transition={SPRING_SOFT}
            className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-[70] -translate-x-1/2"
          >
            <div className="glass-panel radius-pill px-4 py-2 text-[0.7rem] tracking-[0.12em] text-white/75 uppercase">
              Email copied
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
