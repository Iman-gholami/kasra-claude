/** Joins class names, skipping falsy values. Small enough to not need clsx/tailwind-merge. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
