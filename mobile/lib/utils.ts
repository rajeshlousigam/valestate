/** Minimal className joiner (RN has no conflicting-class problem like web). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
