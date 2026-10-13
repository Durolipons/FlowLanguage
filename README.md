# Lingua — a Rosetta Stone–style language learning app

A free, personal alternative to Rosetta Stone, built with **React Native + Expo**.
One TypeScript codebase runs on **iOS, Android, and the web** (installable as a
desktop PWA). It uses the "Dynamic Immersion" idea: you learn through images,
audio and context — no translation in the lessons.

## Features (MVP)

- **5 exercise types** (auto-generated from vocabulary):
  - 🔊 **Listen & Match** — hear a word, tap the matching image
  - 🖼️ **Read & Match** — see a word, tap the matching image
  - 🔤 **Image → Text** — see an image, tap the matching word
  - 🎤 **Pronounce** — hear it, repeat it aloud (on-device speech recognition)
  - 🧩 **Build the Sentence** — arrange word tiles into the correct phrase
- **Text-to-speech** in every lesson (native voices per language)
- **Progress tracking** in a local SQLite database (offline-first)
- **Daily streak + goal + XP** — built for a morning routine
- **Spaced-repetition review** queue (simplified SM-2) so words resurface at
  the right time
- **Multiple languages**, switchable at runtime (Spanish + French included)

## Run it

Requires Node.js (already installed). From this folder:

```bash
npm install            # first time only

npm run web            # desktop: opens in browser (installable PWA)
# or
npx expo start         # then press "a" for Android, "i" for iOS,
                       # or scan the QR code with the Expo Go app
```

- **Phone (easiest):** install the free **Expo Go** app, run `npx expo start`,
  and scan the QR code.
- **Desktop:** `npm run web` opens the app in your browser; you can "Install"
  it as a PWA from the address bar.
- Type-check anytime with `npm run typecheck`.

## Project structure

```
app/                     # screens (Expo Router, file-based routing)
  index.tsx              # home dashboard: streak, daily goal, continue, review
  languages.tsx          # language picker
  unit/[id].tsx          # a unit and its lessons
  lesson/[id].tsx        # the lesson player + completion summary
  review.tsx             # spaced-repetition review queue
src/
  content/               # language packs (data-driven) + exercise engine
    schema.ts            # content types
    es.ts, fr.ts         # the actual vocabulary for each language
    engine.ts            # turns lesson items into exercise instances
  exercises/             # the 5 exercise components + router
  audio/                 # text-to-speech + speech-recognition wrappers
  db/progress.ts         # SQLite: lessons, per-item SRS, streak, XP
  srs/scheduler.ts       # spaced-repetition algorithm
  state/useAppStore.ts   # Zustand store tying content + persistence together
  components/            # shared UI + the ExercisePlayer orchestrator
  theme.ts               # colors, spacing, typography
```

## Adding content or a new language

Content is **data-driven** — you only add vocabulary, not exercise wiring.

1. Copy `src/content/es.ts` to e.g. `src/content/de.ts`, edit the `code`,
   `name`, `flag`, `speechLocale`/`ttsLanguage` (e.g. `de-DE`), the `items`,
   and the `units`/`lessons`.
2. Register it in `src/content/index.ts`: `import { dePack } from './de';` and
   add it to `export const packs = [esPack, frPack, dePack];`.

Each item has a `text` (target), `translation` (English, hidden in lessons),
and an `emoji` (used as the visual). Multi-word phrases automatically get a
**Build the Sentence** exercise.

## Notes & current limitations

- **Images are emoji placeholders** so the MVP needs no asset files. The schema
  supports real images: set an item's `image` to a URL (or wire up bundled
  assets) and the same exercises use it.
- **Audio is on-device TTS.** The schema also supports recorded audio (`audio`
  field) if you later add native-speaker recordings.
- **Speech recognition** requires a device/browser that supports it:
  - iOS/Android: system speech recognition (grant mic + speech permission)
  - Web: Chrome/Edge (Web Speech API). If unavailable, the Pronounce exercise
    shows an "I said it" self-check fallback.
- **Web storage uses SQLite via WebAssembly (OPFS).** It works when served over
  `http(s)` (e.g. `expo start --web` or a static host), not from `file://`.

## Tech stack

React Native 0.87 · Expo SDK 57 · expo-router · expo-speech ·
expo-speech-recognition · expo-sqlite · Zustand · TypeScript.
