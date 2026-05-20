export type InlayKind = 'single' | 'double'

export interface InlayMarker {
  readonly fret: number
  readonly kind: InlayKind
}

export const INLAY_FRETS: readonly InlayMarker[] = Object.freeze([
  { fret: 3, kind: 'single' },
  { fret: 5, kind: 'single' },
  { fret: 7, kind: 'single' },
  { fret: 9, kind: 'single' },
  { fret: 12, kind: 'double' },
  { fret: 15, kind: 'single' },
  { fret: 17, kind: 'single' },
  { fret: 19, kind: 'single' },
  { fret: 21, kind: 'single' },
  { fret: 24, kind: 'double' },
])

export function inlaysInRange(maxFret: number): readonly InlayMarker[] {
  return INLAY_FRETS.filter((i) => i.fret <= maxFret)
}
