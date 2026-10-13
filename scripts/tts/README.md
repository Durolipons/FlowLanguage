# Voice generation (Kokoro / Chatterbox)

Generate natural, **commercially-licensed** voice files for every vocabulary
item, then wire them into the app so lessons play real speech instead of
on-device TTS.

## Engine choice

| | Kokoro-82M | Chatterbox |
|---|---|---|
| License | **Apache 2.0** | **MIT** (output watermarked) |
| Size / speed | 82M — tiny, fast, CPU-friendly | ~0.5B — GPU ideal |
| Spanish + French | ✅ built-in voices | ✅ + 20 more languages |
| Voice cloning | ❌ (pick a built-in voice) | ✅ clone from a reference clip |
| Install | `pip install kokoro soundfile misaki[en]` + espeak-ng | `pip install chatterbox-tts` |

Both need a **Python 3.9–3.11** environment. Model weights (~80 MB Kokoro,
~1–2 GB Chatterbox) download on first run.

**Kokoro on Windows also needs the `espeak-ng` system package** (phonemization):
https://github.com/espeak-ng/espeak-ng/releases — install the `.msi`.

## Generate (Spanish / French)

```bash
npm run tts:manifest     # export vocabulary text -> scripts/tts/manifest.json

# Kokoro (no reference clip needed; uses a built-in voice)
python scripts/tts/generate_voices.py --engine kokoro --lang es
python scripts/tts/generate_voices.py --engine kokoro --lang fr

# Chatterbox (clone a voice from a ~6s clip in voices/)
python scripts/tts/generate_voices.py --engine chatterbox --lang fr \
    --speaker ../voices/fr_ref.wav --gpu

npm run register:audio   # rebuild audioAssets.ts from assets/audio/ on disk
```

- Existing files are skipped unless you pass `--force`.
- Output: `assets/audio/<lang>/<slug>.wav` (24 kHz).
- After `register:audio`, items with a file play the recording; the rest fall
  back to on-device TTS.
- Override Kokoro's voice with `--voice` (e.g. `em_alex`, `ef_dora`, `ff_siwis`).

## Rare languages (Shona, Zulu, …) — different path

**Neither Kokoro nor Chatterbox supports rare languages** — they only cover a
fixed set. For those, fine-tune a small model instead:

1. **Data:** Mozilla **Common Voice** has Shona & Zulu datasets (CC0). Other
   sources: Bible.is, local corpora.
2. **Phonemizer:** `espeak-ng` covers many African languages (verify sn/zu; else
   you need a custom grapheme-to-phoneme model).
3. **Train:** **Piper** is the standard tool for low-resource, on-device voices
   (there are community guides for African languages). Train on the CC0 data.
4. **Ship files, not the model:** generate WAVs offline into `assets/audio/<lang>/`
   and run `npm run register:audio`. Because you only distribute the generated
   audio (not the Piper engine), the app stays license-clean. *(Not legal advice.)*

The app itself needs no changes for a new language — add a content pack and drop
in its audio.
