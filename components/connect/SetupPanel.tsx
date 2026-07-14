"use client";

import { SETUP_ITEMS, SETUP_PANEL } from "@/data/connect";
import { SetupIcon } from "@/components/connect/SetupIcon";
import { cn } from "@/lib/cn";

type SetupPanelProps = {
  className?: string;
};

const PANEL_SURFACE =
  "border-white/[0.07] bg-[linear-gradient(155deg,rgba(255,255,255,0.045)_0%,rgba(11,18,32,0.72)_45%,rgba(5,8,22,0.88)_100%)]";

/**
 * Slim floating glass — compact hardware list.
 */
export function SetupPanel({ className }: SetupPanelProps) {
  return (
    <aside
      aria-label={SETUP_PANEL.title}
      className={cn(
        "glass-panel radius-panel panel-pad flex h-full flex-col",
        PANEL_SURFACE,
        className,
      )}
    >
      <p className="text-section text-[0.625rem] tracking-[0.22em] text-white/34">
        {SETUP_PANEL.title}
      </p>

      <ul className="mt-3 flex flex-1 flex-col justify-center gap-3">
        {SETUP_ITEMS.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span className="icon-plate text-white/62">
              <SetupIcon id={item.icon} />
            </span>
            <span className="min-w-0 text-left">
              <span className="text-panel-title block truncate">{item.name}</span>
              <span className="text-panel-label mt-0.5 block">{item.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
