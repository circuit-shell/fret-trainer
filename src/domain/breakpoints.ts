export const BREAKPOINTS = Object.freeze({
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const)

export function maxFretForViewport(widthPx: number): number {
  if (widthPx >= BREAKPOINTS.xl) return 24
  if (widthPx >= BREAKPOINTS.lg) return 17
  if (widthPx >= BREAKPOINTS.md) return 15
  return 12
}
