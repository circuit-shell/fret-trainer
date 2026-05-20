import { createContext, useCallback, useContext } from 'react'
import { type Language, DEFAULT_LANGUAGE, translate } from '../domain/i18n'

/** React context that carries the current UI language down the tree. App.tsx
 * wires `settings.language` into the provider; any descendant component can
 * read it via `useTranslation` or `useLanguage` below. Default is English
 * for tests and stories that render components outside the provider. */
const LanguageContext = createContext<Language>(DEFAULT_LANGUAGE)

export const LanguageProvider = LanguageContext.Provider

/** Returns a stable `t(key)` function that resolves translation keys against
 * the current language. Use it like:
 *
 *   const t = useTranslation()
 *   <span>{t('target.label')}</span>
 *
 * Falls back to English then to the key itself when a translation is missing
 * (so untranslated keys are visible in dev). */
export function useTranslation(): (key: string) => string {
  const language = useContext(LanguageContext)
  return useCallback((key: string) => translate(language, key), [language])
}

/** Returns the current language code. Useful when a component needs the raw
 * value (e.g. to pass to a settings dropdown) rather than the translator. */
export function useLanguage(): Language {
  return useContext(LanguageContext)
}
