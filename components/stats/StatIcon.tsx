import type { ReactElement, SVGProps } from "react";
import type { StatIconId } from "@/types/stats";
import { cn } from "@/lib/cn";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = (props: IconProps) => ReactElement;

const SVG_CRISP = {
  preserveAspectRatio: "xMidYMid meet" as const,
  shapeRendering: "geometricPrecision" as const,
};

function YouTubeIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.5 3.5-6.5 3.5Z" />
    </svg>
  );
}

function InstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Z" />
      <path d="M17.5 6.2a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" />
      <path d="M12 2.2c-2.7 0-3 .01-4.1.06-2.7.12-4 1.4-4.1 4.1C3.71 7.5 3.7 7.8 3.7 10.5s.01 3 .06 4.1c.12 2.7 1.4 4 4.1 4.1 1.1.05 1.4.06 4.1.06s3-.01 4.1-.06c2.7-.12 4-1.4 4.1-4.1.05-1.1.06-1.4.06-4.1s-.01-3-.06-4.1c-.12-2.7-1.4-4-4.1-4.1-1.1-.05-1.4-.06-4.1-.06Zm0 1.8c2.6 0 2.9.01 4 .06 1.9.09 2.8.98 2.9 2.9.05 1 .06 1.3.06 4s-.01 2.9-.06 4c-.09 1.9-.98 2.8-2.9 2.9-1 .05-1.3.06-4 .06s-2.9-.01-4-.06c-1.9-.09-2.8-.98-2.9-2.9C5.01 13.4 5 13.1 5 10.5s.01-2.9.06-4c.09-1.9.98-2.8 2.9-2.9 1.1-.05 1.4-.06 4.04-.06Z" />
    </svg>
  );
}

function FacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3.1l.9-3H13v-2c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function VideosIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <rect x="3" y="5" width="14" height="14" rx="2.5" />
      <path
        d="M17 10.5 21 8v8l-4-2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ViewsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LiveIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      {...SVG_CRISP}
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="12"
        cy="12"
        r="8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.45"
      />
    </svg>
  );
}

const ICONS: Record<StatIconId, IconComponent> = {
  youtube: YouTubeIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  videos: VideosIcon,
  views: ViewsIcon,
  live: LiveIcon,
};

export function StatIcon({
  id,
  className,
}: {
  id: StatIconId;
  className?: string;
}) {
  const Icon = ICONS[id];
  return <Icon className={cn("icon-crisp", className)} />;
}
