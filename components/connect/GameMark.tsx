import type { JSX, SVGProps } from "react";
import type { GameMarkId } from "@/data/connect";
import { cn } from "@/lib/cn";

type MarkProps = SVGProps<SVGSVGElement> & {
  className?: string;
};

/**
 * Official Riot Games Valorant logomark (Simple Icons / playvalorant.com).
 */
function ValorantMark({ className, ...props }: MarkProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      <title>Valorant</title>
      <path d="M23.792 2.152a.252.252 0 0 0-.098.083c-3.384 4.23-6.769 8.46-10.15 12.69-.107.093-.025.288.119.265 2.439.003 4.877 0 7.316.001a.66.66 0 0 0 .552-.25c.774-.967 1.55-1.934 2.324-2.903a.72.72 0 0 0 .144-.49c-.002-3.077 0-6.153-.003-9.23.016-.11-.1-.206-.204-.167zM.077 2.166c-.077.038-.074.132-.076.205.002 3.074.001 6.15.001 9.225a.679.679 0 0 0 .158.463l7.64 9.55c.12.152.308.25.505.247 2.455 0 4.91.003 7.365 0 .142.02.222-.174.116-.265C10.661 15.176 5.526 8.766.4 2.35c-.08-.094-.174-.272-.322-.184z" />
    </svg>
  );
}

/**
 * Official Rockstar Games Grand Theft Auto V product mark —
 * black plate + white V as used on Rockstar / storefront branding.
 */
function GtavMark({ className, ...props }: MarkProps) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      {...props}
    >
      <title>Grand Theft Auto V</title>
      <rect width="24" height="24" rx="2.5" fill="#000000" />
      <path
        fill="#FFFFFF"
        d="M6.15 5.1h4.05l1.85 9.55L13.9 5.1h4.05L14.1 18.9h-3.15L6.15 5.1Z"
      />
    </svg>
  );
}

const MARKS: Record<GameMarkId, (props: MarkProps) => JSX.Element> = {
  valorant: ValorantMark,
  gtav: GtavMark,
};

type GameMarkProps = {
  id: GameMarkId;
  className?: string;
};

export function GameMark({ id, className }: GameMarkProps) {
  const Mark = MARKS[id];
  return (
    <Mark
      className={cn("icon-crisp h-5 w-5 sm:h-6 sm:w-6", className)}
    />
  );
}
