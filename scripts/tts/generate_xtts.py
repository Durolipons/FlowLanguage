#!/usr/bin/env python3
r"""Generate natural voice files for vocabulary using Coqui XTTS-v2.

XTTS-v2 clones a voice from a short (~6s) reference clip, so you get one
consistent, natural-sounding voice per language. Supported languages include
Spanish (es) and French (fr). Output is 24 kHz WAV.

Requirements (Python 3.9-3.11 -- coqui-tts does NOT support 3.12+):
    python -m venv .venv && . .venv/bin/activate   # (Windows: .venv\Scripts\activate)
    pip install coqui-tts                          # or: pip install TTS
The model (~2 GB) downloads automatically on first run.

Usage:
    npm run tts:manifest                                   # 1. export texts
    python scripts/tts/generate_xtts.py --lang es \
        --speaker voices/es_ref.wav                        # 2. generate
    python scripts/tts/generate_xtts.py --lang fr --speaker voices/fr_ref.wav --gpu
    npm run register:audio                                 # 3. wire into the app
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MANIFEST = os.path.join(HERE, "manifest.json")
DEFAULT_MODEL = "tts_models/multilingual/multi-dataset/xtts_v2"


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate XTTS-v2 voice files for vocabulary.")
    ap.add_argument("--lang", required=True, choices=["es", "fr"], help="target language code")
    ap.add_argument("--speaker", required=True, help="reference .wav clip to clone the voice from")
    ap.add_argument("--gpu", action="store_true", help="use CUDA if available")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    ap.add_argument("--model", default=DEFAULT_MODEL, help="XTTS model name")
    args = ap.parse_args()

    if not os.path.exists(args.speaker):
        sys.exit(f"Reference voice not found: {args.speaker}")
    if not os.path.exists(MANIFEST):
        sys.exit(f"Manifest not found: {MANIFEST} -- run `npm run tts:manifest` first.")
    with open(MANIFEST, encoding="utf-8") as f:
        manifest = json.load(f)
    items = manifest.get(args.lang, [])
    if not items:
        sys.exit(f"No items for language '{args.lang}' in {MANIFEST}")

    out_dir = os.path.join(ROOT, "assets", "audio", args.lang)
    os.makedirs(out_dir, exist_ok=True)

    # Imported late so `--help` works even without the heavy deps installed.
    try:
        import torch  # noqa: F401
        from TTS.api import TTS
    except Exception as e:  # pragma: no cover
        sys.exit(
            "coqui-tts is not available. In a Python 3.9-3.11 environment run:\n"
            "    pip install coqui-tts\n"
            f"Import error: {e}"
        )

    import torch

    use_gpu = bool(args.gpu) and torch.cuda.is_available()
    device = "cuda" if use_gpu else "cpu"
    print(f"Loading {args.model} on {device} ...")
    tts = TTS(args.model, gpu=use_gpu)

    done = skipped = failed = 0
    for it in items:
        item_id = it["id"]
        text = it["text"]
        slug = item_id.split("-", 1)[1] if "-" in item_id else item_id
        out_path = os.path.join(out_dir, f"{slug}.wav")
        if os.path.exists(out_path) and not args.force:
            skipped += 1
            continue
        try:
            tts.tts_to_file(
                text=text,
                file_path=out_path,
                speaker_wav=args.speaker,
                language=args.lang,
            )
            done += 1
            print(f"  ok {item_id} -> assets/audio/{args.lang}/{slug}.wav")
        except Exception as e:
            failed += 1
            print(f"  FAIL {item_id}: {e}")

    print(f"\nDone. generated={done} skipped={skipped} failed={failed}")
    print("Register them in the app with:  npm run register:audio")


if __name__ == "__main__":
    main()
