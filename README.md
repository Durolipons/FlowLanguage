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

## Bulk-importing real images & audio

Add real assets in bulk from a manifest (JSON or CSV) that maps item id → URL:

```bash
cp assets/manifest.example.json assets/manifest.json   # fill in your URLs
npm run import:assets                                    # link mode (reference remote URLs)
npm run import:assets -- --download                      # download mode (fetch + rebundle offline)
npm run import:assets -- --manifest assets/my.csv        # use a CSV instead
```

- Manifest keys are item ids (e.g. `es-agua`); see `assets/manifest.example.json` / `.csv`.
- **Link mode** writes URLs to `src/content/assets/remoteAssets.ts` (bundled assets still take priority).
- **Download mode** saves files into `assets/images|audio/<lang>/`, replaces any placeholder, and regenerates the bundled registries.
- Resolution order: **bundled asset → remote URL → item's own `image`/`audio` → emoji / TTS**.

## Notes & current limitations

- **Images:** every item shows a bundled image first, then a remote `image` URL,
  then an emoji. The repo ships **placeholder** PNGs for all items
  (`assets/images/<lang>/`), wired via `src/content/assets/imageAssets.ts`.
  Replace any PNG with a real photo (same filename) — no code changes needed.
  Regenerate placeholders with `npm run gen:images`.
- **Recorded audio:** `src/audio/player.ts` plays a bundled recording or a
  remote `audio` URL via `expo-audio`, falling back to on-device TTS.
  `audioAssets.ts` ships empty (TTS everywhere); run `npm run gen:audio` to test
  the recorded path with placeholder tones, then drop real recordings in
  `assets/audio/<lang>/`.
- **Speech recognition** requires a device/browser that supports it:
  - iOS/Android: system speech recognition (grant mic + speech permission)
  - Web: Chrome/Edge (Web Speech API). If unavailable, the Pronounce exercise
    shows an "I said it" self-check fallback.
- **Web storage uses SQLite via WebAssembly (OPFS).** It works when served over
  `http(s)` (e.g. `expo start --web` or a static host), not from `file://`.

## Tech stack

React Native 0.87 · Expo SDK 57 · expo-router · expo-speech ·
expo-speech-recognition · expo-audio · expo-asset · expo-sqlite · Zustand ·
TypeScript.
