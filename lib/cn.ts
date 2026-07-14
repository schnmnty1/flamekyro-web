/**
 * Lightweight className merger — filters falsy values.
 * Prefer this over string concatenation for conditional Tailwind classes.
 */
export function cn(
  ...inputs: Array<string | false | null | undefined>
): string {
  return inputs.filter(Boolean).join(" ");
}
