import { DEFAULT_NOTATION, type NotationSystem } from './notation'
import { DEFAULT_LANGUAGE, type Language } from './i18n'

export interface Settings {
  showReferenceMarkers: boolean
  referenceNamesVisible: boolean
  pianoLabelsVisible: boolean
  blackKeyLabelsVisible: boolean
  inlayDotsVisible: boolean
  fretNumbersTopVisible: boolean
  fretNumbersBottomVisible: boolean
  stringNumbersVisible: boolean
  stringLinesVisible: boolean
  notation: NotationSystem
  fretCount: number
  soundEnabled: boolean
  language: Language
}

export const FRET_COUNT_MIN = 12
export const FRET_COUNT_MAX = 24

export const DEFAULT_SETTINGS: Settings = {
  showReferenceMarkers: true,
  referenceNamesVisible: true,
  pianoLabelsVisible: true,
  blackKeyLabelsVisible: true,
  inlayDotsVisible: true,
  fretNumbersTopVisible: false,
  fretNumbersBottomVisible: false,
  stringNumbersVisible: false,
  stringLinesVisible: true,
  notation: DEFAULT_NOTATION,
  fretCount: FRET_COUNT_MIN,
  soundEnabled: false,
  language: DEFAULT_LANGUAGE,
}

export function clampFretCount(n: number): number {
  if (!Number.isFinite(n)) return FRET_COUNT_MIN
  const i = Math.round(n)
  if (i < FRET_COUNT_MIN) return FRET_COUNT_MIN
  if (i > FRET_COUNT_MAX) return FRET_COUNT_MAX
  return i
}

export const SETTINGS_STORAGE_KEY = 'fretboard-trainer.settings.v1'
