// Internationalization — string translations and language registry.
//
// Adding a new language:
//   1. Add the language code to the `Language` union below.
//   2. Add an entry to `LANGUAGES` with its native-language label.
//   3. Add a translation dictionary alongside `en` and `es`.
//   4. Add it to the `TRANSLATIONS` record.
// `translate()` falls back to English for any missing key.

export type Language = 'en' | 'es'

export const DEFAULT_LANGUAGE: Language = 'en'

export interface LanguageDef {
  /** ISO-style code stored in localStorage and used everywhere internally. */
  readonly code: Language
  /** The language's name in its own language — shown in the dropdown so a
   * user who can't read the current UI language can still recognize it. */
  readonly label: string
}

export const LANGUAGES: readonly LanguageDef[] = Object.freeze([
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
])

type TranslationDict = Record<string, string>

const en: TranslationDict = {
  // App chrome
  'app.subtitle': "Ted's Method to Learning notes on the fretboard",
  'app.aria.openMethod':
    "FretTrainer — Ted's method to learning notes on the fretboard. Open method explanation.",

  // Target note display
  'target.label': 'Find the note',
  'target.label.row1': 'Find the note',
  'target.label.row2': 'in every string',
  'target.aria.pickRandom': 'Pick a random note to start',
  'target.aria.reroll': 'Re-roll random note',

  // Session timer
  'timer.label.row1': 'Fifteen minutes',
  'timer.label.row2': 'a day practice',

  // Settings drawer chrome
  'settings.title': 'Settings',
  'settings.close': 'Close settings',
  'settings.section.fretboard': 'Fretboard',
  'settings.section.piano': 'Piano',
  'settings.section.audio': 'Audio',
  'settings.section.notation': 'Notation',
  'settings.section.language': 'Language',
  'settings.resetDefaults': 'Reset to defaults',
  'settings.createdBy': 'Created by',

  // Toggle labels
  'settings.toggle.referenceNotes': 'Show reference notes',
  'settings.toggle.referenceNames': 'Show reference note names',
  'settings.toggle.inlayDots': 'Show inlay dots',
  'settings.toggle.fretNumbersTop': 'Fret numbers on top',
  'settings.toggle.fretNumbersBottom': 'Fret numbers on bottom',
  'settings.toggle.stringNumbers': 'Show string numbers',
  'settings.toggle.stringLines': 'Show string lines',
  'settings.toggle.pianoLabels': 'Show piano labels',
  'settings.toggle.blackKeyLabels': 'Show black-key labels',
  'settings.toggle.sound': 'Sound',

  // Notation control
  'notation.letters': 'Letters',
  'notation.solfege': 'Solfège',

  // Fret-count slider
  'fretCount.label': 'Frets',

  // Method modal
  'method.pageTitle.method': 'The Ted Greene method',
  'method.pageTitle.usage': 'How to use this app',
  'method.back': '← Back',
  'method.next': 'Next →',
  'method.gotIt': 'Got it',
  'method.close': 'Close method explanation',

  // Round-complete banner
  'round.complete': 'Round complete!',
  'round.nextRandom': 'Next random note',
}

const es: TranslationDict = {
  // App chrome
  'app.subtitle': 'El método de Ted para aprender las notas del diapasón',
  'app.aria.openMethod':
    'FretTrainer — El método de Ted para aprender las notas del diapasón. Abrir explicación del método.',

  // Target note display
  'target.label': 'Encuentra la nota',
  'target.label.row1': 'Toca la nota',
  'target.label.row2': 'en todas las cuerdas',
  'target.aria.pickRandom': 'Elige una nota al azar para empezar',
  'target.aria.reroll': 'Tirar una nota al azar',

  // Session timer
  'timer.label.row1': 'Quince minutos',
  'timer.label.row2': 'de práctica al día',

  // Settings drawer chrome
  'settings.title': 'Ajustes',
  'settings.close': 'Cerrar ajustes',
  'settings.section.fretboard': 'Diapasón',
  'settings.section.piano': 'Piano',
  'settings.section.audio': 'Audio',
  'settings.section.notation': 'Notación',
  'settings.section.language': 'Idioma',
  'settings.resetDefaults': 'Restablecer ajustes',
  'settings.createdBy': 'Creado por',

  // Toggle labels
  'settings.toggle.referenceNotes': 'Mostrar notas de referencia',
  'settings.toggle.referenceNames': 'Mostrar nombres de notas de referencia',
  'settings.toggle.inlayDots': 'Mostrar marcadores del diapasón',
  'settings.toggle.fretNumbersTop': 'Números de trastes arriba',
  'settings.toggle.fretNumbersBottom': 'Números de trastes abajo',
  'settings.toggle.stringNumbers': 'Mostrar números de cuerda',
  'settings.toggle.stringLines': 'Mostrar líneas de cuerda',
  'settings.toggle.pianoLabels': 'Mostrar etiquetas del piano',
  'settings.toggle.blackKeyLabels': 'Mostrar etiquetas de teclas negras',
  'settings.toggle.sound': 'Sonido',

  // Notation control
  'notation.letters': 'Letras',
  'notation.solfege': 'Solfeo',

  // Fret-count slider
  'fretCount.label': 'Trastes',

  // Method modal
  'method.pageTitle.method': 'El método Ted Greene',
  'method.pageTitle.usage': 'Cómo usar la app',
  'method.back': '← Atrás',
  'method.next': 'Siguiente →',
  'method.gotIt': 'Entendido',
  'method.close': 'Cerrar explicación del método',

  // Round-complete banner
  'round.complete': '¡Ronda completa!',
  'round.nextRandom': 'Siguiente nota al azar',
}

const TRANSLATIONS: Record<Language, TranslationDict> = { en, es }

/** Look up a translation key. Falls back to English when the active language
 * doesn't have a value, and to the key itself when neither does. */
export function translate(language: Language, key: string): string {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS[DEFAULT_LANGUAGE]?.[key] ?? key
}
