import type { JSX, SVGProps } from "react";
import type { SetupIconId } from "@/data/connect";
import { cn } from "@/lib/cn";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/** Premium laptop glyph */
function LaptopMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      <rect x="4" y="4.5" width="16" height="11" rx="1.6" />
      <path d="M2.5 18.5h19" />
      <path d="M8 18.5h8" opacity="0.45" />
    </svg>
  );
}

/** Premium GPU / discrete graphics glyph */
function GpuMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="9" cy="12" r="2.4" />
      <path d="M14.5 9.5h3.5M14.5 12h3.5M14.5 14.5h3.5" />
      <path d="M3 9.5H1.8M3 12H1.8M3 14.5H1.8" />
    </svg>
  );
}

/** Premium gaming headset glyph */
function HeadsetMark({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      <path d="M4.5 13.5v-2a7.5 7.5 0 0 1 15 0v2" />
      <path d="M4.5 13.5v3.2a1.8 1.8 0 0 0 1.8 1.8H8" />
      <path d="M19.5 13.5v3.2a1.8 1.8 0 0 1-1.8 1.8H14v-1.2a1.4 1.4 0 0 1 1.4-1.4h4.1" />
      <path d="M4.5 13.5H6a1.5 1.5 0 0 1 1.5 1.5v1" />
    </svg>
  );
}

const ICONS: Record<SetupIconId, (props: IconProps) => JSX.Element> = {
  laptop: LaptopMark,
  gpu: GpuMark,
  headset: HeadsetMark,
};

type SetupIconProps = {
  id: SetupIconId;
  className?: string;
};

export function SetupIcon({ id, className }: SetupIconProps) {
  const Icon = ICONS[id];
  return <Icon className={cn("icon-crisp h-4 w-4", className)} />;
}
