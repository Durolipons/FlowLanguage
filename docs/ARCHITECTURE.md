# FlowLanguage — Architecture

FlowLanguage is a **Dynamic Immersion** language app (a free, personal alternative
to Rosetta Stone). You learn through images, audio and context — no translation in
the lessons. One React Native + Expo codebase runs on iOS, Android, and the web
(installable desktop PWA).

This document describes the **Course Generation Layer**: how course content and
its media (audio + images) are produced offline, and how the runtime app consumes
them.

---

## 1. The key principle: engines are *generation-time*, not runtime

The **runtime app is engine-agnostic.** It never runs a TTS model. It plays
**pre-generated audio/image files** that are registered in code, and falls back to
**on-device TTS** only when a file is missing.

That separation is what keeps the app **license-clean and lightweight**: heavy
models (Kokoro, Chatterbox, Piper) run on a dev machine to *produce assets*; the
shipped app only contains the resulting WAV/PNG files.

```
        ┌──────────────────────── OFFLINE (dev machine) ────────────────────────┐
        │                                                                        │
        │   CONTENT (data-driven packs)          COURSE GENERATION LAYER          │
        │   ┌────────────────────┐              (choose engine per content type) │
        │   │ language packs     │──vocab──▶  ├── Kokoro   (Apache-2.0)          │
        │   │  units→lessons→    │             │    en · es · fr · de             │
        │   │  items             │             │                                   │
        │   │ dialogue scripts   │──dialog─▶  ├── Chatterbox (MIT)               │
        │   │  (future)          │             │    dialogues · listening         │
        │   └────────────────────┘             │                                   │
        │                                      └── Piper    (fine-tuned)         │
        │   IMAGE SOURCES                             shona · zulu · low-resource │
        │   Openverse · Wikimedia                        │                        │
        │   · Pixabay · Unsplash ────────────┐           │                        │
        │                                     ▼           ▼                        │
        │                              assets/audio/<lang>/*.wav                  │
        │                              assets/images/<lang>/*.png                 │
        │                                     │                                    │
        │                              registries (imageAssets.ts,                │
        │                              audioAssets.ts, remoteAssets.ts)           │
        └─────────────────────────────────────┼────────────────────────────────────┘
                                              ▼
        ┌──────────────────────── RUNTIME (the shipped app) ─────────────────────┐
        │   content packs + registries  →  exercises / dialogue player           │
        │   plays registered file, else falls back to on-device TTS (expo-speech)│
        └─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Runtime architecture

- **Framework:** React Native + Expo SDK 57 (TypeScript). Screens via `expo-router`.
- **Content-driven:** each language is a `LanguagePack` (`src/content/<code>.ts`) —
  `units → lessons → items`. The 5 exercise types (listen/read match, image→text,
  pronounce, build-sentence) are **auto-generated** from items, so adding
  vocabulary needs no UI code.
- **Media resolution** (per item):
  - **Image:** bundled `imageAssets[id]` → remote URL `remoteImages[id]` → item's
    own `image` URL → emoji fallback (`src/components/Visual.tsx`).
  - **Audio:** bundled `audioAssets[id]` → remote `remoteAudio[id]` → item's
    `audio` URL → on-device TTS (`src/audio/player.ts`).
- **Progress:** local SQLite (`expo-sqlite`) — lessons, per-item spaced repetition
  (SM-2), daily streak + XP. Offline-first.

---

## 3. Course Generation Layer (engine → content type)

| Engine | License | Best for | Languages |
|--------|---------|----------|-----------|
| **Kokoro-82M** | Apache 2.0 ✅ | Bulk **vocabulary** — fast, CPU-friendly, built-in voices | en, es, fr, de (+ more) |
| **Chatterbox** | MIT ✅ (watermarked output) | **Dialogues** & listening — expressive, clones a character voice | es, fr + ~20 |
| **Piper** | GPL engine (ship files, not engine) | **Low-resource** languages via fine-tuning | shona, zulu, … |

**Rationale for the split:**
- **Kokoro** — fast, excellent quality, Apache 2.0 (commercially friendly). The
  default for **vocabulary, phrases, and even straightforward dialogues**.
- **Chatterbox** — higher expressive range; use it where emotion, storytelling,
  and distinct character voices matter — **conversations and listening
  exercises**. Gives dialogues more life than typical TTS.
- **Piper** — extremely lightweight, runs on almost anything; the **fallback
  engine** and the only viable route for **Shona, Zulu**, and other languages the
  big multilingual models don't yet support well.

> **License note (why not XTTS-v2):** XTTS-v2 weights are under the *Coqui Public
> Model License* — **non-commercial, and the outputs inherit the restriction**.
> Kokoro (Apache 2.0) and Chatterbox (MIT) are commercially safe. F5-TTS weights
> are also non-commercial — avoid. Because the app ships generated files (not the
> models), permissive-licensed engines keep the whole product clean.

---

## 4. Content model

Current (`src/content/schema.ts`):

- `LanguagePack { code, name, flag, speechLocale, ttsLanguage, items, units }`
- `LexicalItem { id, text, translation, emoji?, image?, audio? }`
- `Unit → Lesson → itemIds[]`  (exercises auto-generated from items)

Planned addition for the Chatterbox track:

- `Dialogue { id, title, language, turns: Turn[] }`
- `Turn { speaker, text, audio? }`  → rendered by a chat-style **dialogue player**;
  generated with a reference clip **per speaker** for distinct voices.

> **Open design question:** the `translation` field is currently **English**. For an
> *English* course you'd want translations in the learner's L1 (or hide them for
> pure immersion). Decide before adding the English pack.

---

## 5. Asset pipeline

### Audio (per language)
`scripts/tts/generate_voices.py` reads `scripts/tts/manifest.json` (exported from
the packs via `npm run tts:manifest`) and writes `assets/audio/<lang>/<slug>.wav`.

```bash
npm run tts:manifest
python scripts/tts/generate_voices.py --engine kokoro    --lang es
python scripts/tts/generate_voices.py --engine chatterbox --lang fr --speaker voices/fr_ref.wav --gpu
npm run register:audio      # rebuild audioAssets.ts from assets/audio/ on disk
```

- **Kokoro** — built-in voices (override with `--voice`); needs the `espeak-ng`
  system package for phonemization.
- **Chatterbox** — clones a voice from a `--speaker` clip (put reference clips in
  `voices/`); GPU recommended.
- **Piper** (low-resource) — fine-tune from **Mozilla Common Voice** (has Shona &
  Zulu, CC0), generate WAVs offline, ship the files. See `scripts/tts/README.md`.

Items without a generated file fall back to on-device TTS, so the app always works.

### Images (per item)
`scripts/import-assets.mjs` takes a manifest (`itemId → imageUrl`) and either
**links** remote URLs or **downloads** them into `assets/images/<lang>/` and
regenerates `imageAssets.ts`. See §6 for where to source the URLs.

```bash
npm run import:assets                 # link remote URLs
npm run import:assets -- --download   # fetch + bundle offline
```

---

## 6. Image sources

All four below are free to use commercially; they differ in licensing, API access,
and attribution needs. Use them to build the `imageUrl` manifest for §5.

| Source | License | API key? | Notes |
|--------|---------|----------|-------|
| **Openverse** | CC (filter by CC0/BY/BY-SA) | ❌ no (rate-limited) | Aggregates CC images; returns `license`, `creator`, landing URL → easy attribution. **Best default.** `api.openverse.org/v1/images/?q=…` |
| **Wikimedia Commons** | CC / public domain | ❌ no | Huge, well-attributed; MediaWiki `action=query&generator=search` API returns URL + license metadata. Great for objects/places. |
| **Pixabay** | Pixabay Content License (commercial OK, no attribution) | ✅ key | Clean, modern stock photos; `pixabay.com/api`. |
| **Unsplash** | Unsplash License (commercial OK) | ✅ key | High-quality photography; `api.unsplash.com/search/photos`. |

**Recommended flow:** query **Openverse** (keyless, CC) first for objects/food/
places; fall back to **Wikimedia Commons**; use **Pixabay/Unsplash** when you want
polished stock and are OK registering a free API key. Always record `creator` +
`license` + source URL per image so you can ship an attribution file.

> **Built:** `scripts/fetch-images.mjs` auto-fetches a suitable image when you add
> a vocabulary item — it queries **Openverse → Wikimedia → Pixabay → Unsplash**
> (first hit wins), saves the file to `assets/images/<lang>/`, and records
> attribution in `assets/images/ATTRIBUTION.json`.
>
> ```bash
> npm run fetch:images -- --lang es --missing        # fill every missing item
> npm run fetch:images -- --lang es --id es-manzana  # one item
> npm run register:images                            # wire bundled images
> ```
>
> Verify current rate limits/keys in each provider's docs.

---

## 7. Data flow (one item, end to end)

1. Author the item in a content pack (`src/content/es.ts`): `text`, `translation`,
   `emoji` (visual), optional `image`/`audio`.
2. **Audio:** `tts:manifest` → `generate_voices.py --engine <kokoro|chatterbox>`
   → `assets/audio/<lang>/<slug>.wav` → `register:audio` → `audioAssets.ts`.
3. **Image:** source a URL (Openverse/Wikimedia/Pixabay/Unsplash) → manifest →
   `import:assets` → `assets/images/<lang>/<slug>.png` → `imageAssets.ts`.
4. **Runtime:** the exercise/dialogue player resolves the file (or TTS/emoji
   fallback) and plays it. No engine runs on device.

---

## 8. Licensing summary (ship-safe)

| Component | License | Ships in app? |
|-----------|---------|---------------|
| App code | (your choice) | yes |
| Kokoro weights/audio | Apache 2.0 | audio files only |
| Chatterbox weights/audio | MIT (Perth watermark) | audio files only |
| Piper engine | GPL-3.0 | **no** — ship generated WAVs, not the engine |
| XTTS-v2 | CPML (non-commercial) | ❌ **removed** |
| F5-TTS weights | non-commercial | ❌ avoid |
| Common Voice data | CC0 | used to train Piper voices |
| Images | per source (§6) | files + attribution |

> Not legal advice. The pattern that keeps you safe: **distribute generated media,
> not the models**, and prefer CC0/Apache/MIT sources with attribution recorded.

---

## 9. Roadmap / tracks

- **[x] Core app** — 5 exercise types, TTS, SQLite progress, SRS, streak/XP.
- **[x] Multi-language** — Spanish, French packs (10 units, 72 items each).
- **[x] Image pipeline** — bundled/remote images, placeholder generator, importer.
- **[x] Audio v1** — TTS + recorded-audio fallback; XTTS replaced with Kokoro/Chatterbox.
- **[ ] Kokoro breadth** — add **English** and **German** packs (decide translation
  language for the English course).
- **[ ] Chatterbox dialogues** — `Dialogue` schema + chat-style player + per-speaker
  voice cloning. *(Differentiating feature.)*
- **[x] Image fetch helper** — `scripts/fetch-images.mjs` over Openverse/Wikimedia/
  Pixabay/Unsplash; auto-fetches on new items + records attribution.
- **[ ] Piper low-resource** — Common Voice → train → ship for Shona/Zulu.

---

## 10. Long-term vision

FlowLanguage Core — a modular learning app where each module reuses the same
**Course Generation Layer** for media and the same runtime primitives (content
packs, registries, SRS, streak):

```
FlowLanguage Core
├── Vocabulary    ✅  Kokoro-backed packs + 5 exercise types
├── Grammar       ⬚  implicit (build-sentence) + explicit drills later
├── Listening     ⬚  Chatterbox dialogues / listening exercises
├── Speaking      ⬚  pronunciation via on-device speech recognition
├── AI Tutor      ⬚  LLM-guided practice
└── Story Mode    ⬚  Chatterbox-narrated stories
```

