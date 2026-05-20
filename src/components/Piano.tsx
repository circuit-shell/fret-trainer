import { NOTES, type Note, type NoteIndex } from '../domain/notes'
import { WHITE_KEYS, BLACK_KEYS } from '../domain/piano'
import {
  type NotationSystem,
  DEFAULT_NOTATION,
  sharpNameIn,
  flatNameIn,
  enharmonicAlternateIn,
} from '../domain/notation'
import { PianoKey } from './PianoKey'

export interface PianoProps {
  selectedNoteIndex: NoteIndex | null
  whiteLabelsVisible: boolean
  blackLabelsVisible: boolean
  notation?: NotationSystem
  onSelect: (note: Note) => void
  onKeyAudio?: (noteIndex: NoteIndex) => void
}

const BLACK_KEY_WIDTH_FRAC = 0.6
const BLACK_HEIGHT_FRAC = 0.62

const SHARP_PHONETIC: Record<string, string> = {
  'C#': 'C sharp',
  'D#': 'D sharp',
  'F#': 'F sharp',
  'G#': 'G sharp',
  'A#': 'A sharp',
}
const FLAT_PHONETIC: Record<string, string> = {
  Db: 'D flat',
  Eb: 'E flat',
  Gb: 'G flat',
  Ab: 'A flat',
  Bb: 'B flat',
}

export function Piano({
  selectedNoteIndex,
  whiteLabelsVisible,
  blackLabelsVisible,
  notation = DEFAULT_NOTATION,
  onSelect,
  onKeyAudio,
}: PianoProps) {
  const whiteKeyWidthPercent = 100 / WHITE_KEYS.length
  // Single click handler so audio + state update share a code path. Audio
  // fires first (research R9 / contract C5) so React state batching can't
  // add latency to the click→sound chain.
  const handleSelect = (idx: NoteIndex) => {
    onKeyAudio?.(idx)
    onSelect(NOTES[idx])
  }

  return (
    <div
      role="group"
      aria-label="Piano picker"
      className="relative w-full max-w-md mx-auto"
      style={{ aspectRatio: '7 / 3' }}
    >
      <div className="absolute inset-0 flex">
        {WHITE_KEYS.map((key) => {
          const selected = selectedNoteIndex === key.noteIndex
          // Visible label follows the chosen notation; aria-label stays in
          // letter form for screen-reader stability across notation toggles.
          const visibleName = sharpNameIn(notation, key.noteIndex)
          // Enharmonic alternate: only the four white keys adjacent to another
          // natural (C↔B#, E↔Fb, F↔E#, B↔Cb) get a secondary label; the rest
          // get null and the PianoKey renders only the primary letter.
          const alternateName = enharmonicAlternateIn(notation, key.noteIndex)
          return (
            <div key={key.name} className="relative flex-1 min-w-tap min-h-tap">
              <PianoKey
                variant="white"
                noteIndex={key.noteIndex}
                visibleLabel={visibleName}
                alternateLabel={alternateName ?? undefined}
                ariaLabel={key.name}
                selected={selected}
                labelsVisible={whiteLabelsVisible}
                onSelect={handleSelect}
                style={{ position: 'absolute', inset: 0 }}
              />
            </div>
          )
        })}
      </div>

      {BLACK_KEYS.map((key) => {
        const selected = selectedNoteIndex === key.noteIndex
        const ariaLabel = `${SHARP_PHONETIC[key.sharpName]} / ${FLAT_PHONETIC[key.flatName]}`
        const centerPercent = (key.leftWhiteKeyIndex + 1) * whiteKeyWidthPercent
        const widthPercent = whiteKeyWidthPercent * BLACK_KEY_WIDTH_FRAC
        const leftPercent = centerPercent - widthPercent / 2
        const visibleSharp = sharpNameIn(notation, key.noteIndex)
        const visibleFlat = flatNameIn(notation, key.noteIndex)
        return (
          <PianoKey
            key={key.sharpName}
            variant="black"
            noteIndex={key.noteIndex}
            visibleLabel={{ sharp: visibleSharp, flat: visibleFlat }}
            ariaLabel={ariaLabel}
            selected={selected}
            labelsVisible={blackLabelsVisible}
            onSelect={handleSelect}
            style={{
              position: 'absolute',
              top: 0,
              left: `${leftPercent}%`,
              width: `${widthPercent}%`,
              height: `${BLACK_HEIGHT_FRAC * 100}%`,
            }}
          />
        )
      })}
    </div>
  )
}
