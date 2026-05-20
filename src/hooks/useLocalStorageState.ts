import { useCallback, useEffect, useState } from 'react'

// useState-shaped hook that mirrors its value into localStorage. On first
// render we try to read the stored value; if absent or unparseable we fall
// back to `defaultValue`. Every value change is persisted on the next
// render. SSR-safe: if `window` is unavailable, we just behave like
// useState.
export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) return defaultValue
      const parsed = JSON.parse(raw) as unknown
      // Light merge so adding a new field to a defaults object doesn't
      // erase it for users who already have a stored value.
      if (
        typeof defaultValue === 'object' &&
        defaultValue !== null &&
        !Array.isArray(defaultValue) &&
        typeof parsed === 'object' &&
        parsed !== null &&
        !Array.isArray(parsed)
      ) {
        return { ...(defaultValue as object), ...(parsed as object) } as T
      }
      return parsed as T
    } catch {
      return defaultValue
    }
  }, [key, defaultValue])

  const [value, setValueRaw] = useState<T>(read)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Quota exceeded, private-mode, etc. — fail silently; in-memory
      // state still works.
    }
  }, [key, value])

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueRaw((prev) =>
        typeof next === 'function' ? (next as (p: T) => T)(prev) : next,
      )
    },
    [],
  )

  return [value, setValue]
}
