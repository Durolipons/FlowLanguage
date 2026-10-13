# Voice generation with XTTS-v2 (Coqui)

Generate natural, cloned voice files for every vocabulary item, then wire them
into the app so lessons play real speech instead of on-device TTS.

## One-time setup (Python 3.9–3.11 — coqui-tts does NOT support 3.12+)

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install coqui-tts        # or: pip install TTS
```

The XTTS-v2 model (~2 GB) downloads automatically on first run. A GPU is
strongly recommended (`--gpu`); CPU works but is slow.

## Add reference voices

Drop one ~6s clean clip per language into `../voices/` (see `../voices/README.md`),
e.g. `voices/es_ref.wav` and `voices/fr_ref.wav`.

## Generate

```bash
npm run tts:manifest      # export the vocabulary text to scripts/tts/manifest.json

python scripts/tts/generate_xtts.py --lang es --speaker ../voices/es_ref.wav
python scripts/tts/generate_xtts.py --lang fr --speaker ../voices/fr_ref.wav --gpu

npm run register:audio    # rebuild audioAssets.ts from assets/audio/ on disk
```

- Existing files are skipped unless you pass `--force`.
- Output: `assets/audio/<lang>/<slug>.wav` (24 kHz).
- After `register:audio`, those items play the recording; items without a file
  still fall back to TTS.

## Notes
- **License:** XTTS-v2 is under the Coqui Public Model License (CPML) —
  non-commercial. Fine for personal use; check terms before distributing.
- To shrink bundle size, convert WAV → MP3 (e.g. `ffmpeg -i in.wav out.mp3`)
  and update the file extension in `audioAssets.ts`.
- `manifest.json` is regenerated from the language packs by `npm run tts:manifest`.
