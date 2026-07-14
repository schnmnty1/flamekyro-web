import { Inter, Orbitron, Space_Grotesk } from "next/font/google";

/**
 * FlameKyro type system
 * - Space Grotesk → primary UI / brand body
 * - Inter → secondary / long-form readability
 * - Orbitron → display headings (gaming aesthetic)
 *
 * CSS variable names are distinct from Tailwind @theme tokens
 * to avoid circular `var(--font-*)` references.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

/** Combined CSS variable class for the root layout */
export const fontVariables = [
  spaceGrotesk.variable,
  inter.variable,
  orbitron.variable,
].join(" ");
