# FretTrainer

Web app for learning the notes on a guitar fretboard. The display shows a
random target note; you tap the matching position on each of the six strings.
Green check means you got it, red cross means you didn't. Round ends when all
six strings have a correct hit.

Pulls from the Ted Greene practice method: anchor naturals first, drill one
note around the neck before moving on.

## Stack

- TypeScript, React 19, Vite
- Tailwind CSS
- Tone.js (lazy-loaded) + sampled piano/guitar via `tonejs-instrument-*-mp3`
- Vitest + React Testing Library for unit and component tests
- Playwright (Chromium desktop, iPhone 12 WebKit) for end-to-end

No backend. Settings persist via `localStorage`.

## Running

```sh
npm install
npm run dev          # dev server at http://localhost:5173
npm run build        # type-check + production bundle into dist/
npm run preview      # serve the production bundle locally
```

Tests:

```sh
npm run test:run     # vitest, one-shot
npm run test:e2e     # playwright, both projects
npm run lint
```

## Layout

```
src/
  App.tsx              composes the page
  domain/              pure-TS logic (notes, fretboard math, round reducer,
                       audio engine, i18n, settings)
  hooks/               useRound, useSessionTimer, useViewportWidth,
                       useAudioEngine, useLocalStorageState, useTranslation
  components/          Fretboard, Fret, Piano, PianoKey, TargetNoteDisplay,
                       SessionTimer, SettingsDrawer, MethodModal, and the
                       various pill-switch toggles
tests/e2e/             Playwright specs, one per user story
```

## Audio

Off by default. Toggle it in `Settings → Audio`. The engine activates on the
first tap after the toggle is on (browsers require a user gesture to start an
AudioContext). Until the sample MP3s decode, taps queue and flush when the
sampler reports ready. Sample fetch failures degrade silently — the rest of
the app keeps working.

## Mobile layout

Below 640px the fretboard is rotated 90 degrees via CSS so strings run
top-to-bottom and the nut sits at the top. Text spans inside cells get a
counter-rotation so letters and check/cross glyphs stay upright.

## Languages

UI strings live in `src/domain/i18n.ts`. To add a language:

1. Add the code (e.g. `'fr'`) to the `Language` union.
2. Add an entry to `LANGUAGES` with its native-language label.
3. Copy the `en` dictionary, translate the values.
4. Add the new dictionary to `TRANSLATIONS`.

Missing keys fall back to English; missing keys in English fall back to the
key string itself, so untranslated strings show up clearly in dev.

## Settings

All booleans (toggles) plus `notation`, `fretCount`, `soundEnabled`, and
`language` are persisted under the key `fretboard-trainer.settings.v1`. New
fields added to the type pick up their default automatically on read — older
stored blobs merge against `DEFAULT_SETTINGS` on load.

## Bundle

Production entry chunk is ~73 KB gzipped. Tone.js and the sample packages are
code-split — they load only when sound is enabled.

## License

Internal practice project. Treble-clef SVG (also used as the favicon) is from
rickvanderzwet on Openclipart, public domain.
