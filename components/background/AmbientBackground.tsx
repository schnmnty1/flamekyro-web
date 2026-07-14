import { cn } from "@/lib/cn";
import { StarField } from "./StarField";

type AmbientBackgroundProps = {
  className?: string;
};

/**
 * Fixed dark-futuristic canvas behind page content.
 * Soft cyan (left) + orange (right) blooms, stars, and dust.
 */
export function AmbientBackground({ className }: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background",
        className,
      )}
    >
      {/* Soft cyan glow — left */}
      <div className="absolute left-[-18%] top-[20%] h-[55vh] w-[50vw] rounded-full bg-glow/[0.12] blur-[110px]" />

      {/* Soft orange glow — right */}
      <div className="absolute bottom-[5%] right-[-12%] h-[50vh] w-[48vw] rounded-full bg-[#F59E0B]/[0.10] blur-[120px]" />

      {/* Quiet violet wash — top center (restrained) */}
      <div className="absolute left-1/2 top-[-25%] h-[45vh] w-[70vw] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[130px]" />

      <StarField />

      {/* Subtle grid for depth */}
      <div className="bg-grid absolute inset-0 opacity-[0.28]" />

      {/* Edge vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-background)_78%)]" />
    </div>
  );
}
