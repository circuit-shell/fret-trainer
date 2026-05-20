import { NOTES, type Note, type NoteIndex } from './notes'
import { slotCount } from './notation'

export interface TargetSelection {
  readonly note: Note
  /** Which of the target pitch's valid names to display (0 = primary,
   * 1 = enharmonic alternate). */
  readonly slot: number
}

/** Pick a random target from the full 21-name pool (12 pitch classes ×
 * 1 or 2 names each). The (note, slot) pair returned never repeats the
 * `previous` exactly, but rolling between two enharmonic spellings of the
 * same pitch — e.g. C → B# → Db — is allowed by design: the user explicitly
 * wants the enharmonic alternates to be drawable. */
export function nextRandomTarget(previous: TargetSelection | null): TargetSelection {
  const pool: TargetSelection[] = []
  for (let i = 0; i <= 11; i++) {
    const idx = i as NoteIndex
    const count = slotCount(idx)
    for (let s = 0; s < count; s++) {
      pool.push({ note: NOTES[idx], slot: s })
    }
  }
  const candidates =
    previous === null
      ? pool
      : pool.filter(
          (t) => !(t.note.index === previous.note.index && t.slot === previous.slot),
        )
  return candidates[Math.floor(Math.random() * candidates.length)]
}
