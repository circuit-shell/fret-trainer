// Type shims for the per-instrument sample packages. The packages ship as
// JavaScript-only and don't include .d.ts files; this module shim gives us
// just enough types to use them from src/domain/audio.ts.
//
// Each package default-exports a class that extends Tone.Sampler. The
// constructor accepts { minify?: boolean, onload?: () => void } — the rest of
// the API surface we care about (triggerAttackRelease, connect) is identical
// to Tone.Sampler.

declare module 'tonejs-instrument-piano-mp3' {
  // We deliberately type it loosely because the engine treats the instance
  // structurally (only `triggerAttackRelease` and `connect`). A tighter type
  // would couple us to Tone.js's Sampler shape unnecessarily.
  export default class InstrumentPianoMp3 {
    constructor(options: { minify?: boolean; onload?: () => void })
    triggerAttackRelease(note: string, duration: string, time?: number): unknown
    connect(target: unknown): unknown
  }
}

declare module 'tonejs-instrument-guitar-acoustic-mp3' {
  export default class InstrumentGuitarAcousticMp3 {
    constructor(options: { minify?: boolean; onload?: () => void })
    triggerAttackRelease(note: string, duration: string, time?: number): unknown
    connect(target: unknown): unknown
  }
}
