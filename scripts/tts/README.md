# Voice generation (Kokoro / Chatterbox / VoxCPM2)

Generate natural, **commercially-licensed** voice files for every vocabulary
item, then wire them into the app so lessons play real speech instead of
on-device TTS.

> Licences verified in `TTS_LICENCE_AUDIT.md`: Kokoro **Apache 2.0**, Chatterbox
> **MIT**, VoxCPM2 **Apache 2.0** (all GREEN). Piper is 🟡 — GPL-3.0 engine plus
> per-voice licences; verify each voice. XTTS-v2 was **removed** (non-commercial).

## Engine choice

| | Kokoro-82M | Chatterbox | VoxCPM2 |
|---|---|---|---|
| License | **Apache 2.0** | **MIT** (output watermarked) | **Apache 2.0** |
| Size / speed | 82M — tiny, fast, CPU | ~0.5B — GPU ideal | ~2.3B, 30 langs — GPU |
| Spanish + French | ✅ built-in voices | ✅ + cloning | ✅ + cloning |
| Polish | ❌ | ✅ (23 langs) | ✅ (30 langs) |
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

## Provider layer (`scripts/tts/engines/`)

Generation goes through a provider registry with a fixed fallback chain
(configured in `engines/config.py`):

```
VoxCPM2 -> Kokoro -> Chatterbox -> Piper   (Piper last: 🟡, unconfigured = skipped)
```

- `engines/base.py` — `TtsEngine` interface (`available`, `supports`, `synth`).
  Heavy imports stay inside methods so the package imports anywhere.
- `engines/{voxcpm,kokoro,chatterbox,piper}_engine.py` — one provider each.
- `engines/registry.py` — `synthesize(engine, …)` and `synthesize_with_fallback(…)`.
- CLI: `--engine voxcpm` (single provider) or `--engine auto` (fallback chain);
  `kokoro`/`chatterbox` keep their original direct paths. Nothing on the app side
  changes — the shipped app only plays registered WAVs with on-device-TTS fallback.
- Piper voices are configured in `config.PIPER_VOICES` **only after** verifying a
  voice's MODEL_CARD licence is commercial-safe; the dict ships **empty**.
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
