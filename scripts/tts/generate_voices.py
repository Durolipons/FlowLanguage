r"""Generate natural voice files for vocabulary using Kokoro or Chatterbox.

Both are commercially usable:
  - Kokoro-82M  : Apache 2.0, ~82M params, fast, runs on CPU. Built-in voices.
  - Chatterbox  : MIT, ~0.5B, higher quality, zero-shot voice cloning. GPU ideal.

Neither supports rare languages (e.g. Shona/Zulu) out of the box -- see README
for the Piper fine-tuning path for those.

Requirements:
  Kokoro:      pip install kokoro soundfile misaki[en]   (+ espeak-ng system pkg)
  Chatterbox:  pip install chatterbox-tts
Model weights download automatically on first run.

Usage:
  npm run tts:manifest      # export texts (run once, and when content changes)
  python scripts/tts/generate_voices.py --engine kokoro --lang es
  python scripts/tts/generate_voices.py --engine chatterbox --lang fr \
      --speaker voices/fr_ref.wav --gpu
  npm run register:audio    # wire generated WAVs into the app
"""
import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MANIFEST = os.path.join(HERE, "manifest.json")

# Kokoro KPipeline lang_code + a sensible default built-in voice per language.
KOKORO = {
    "es": {"lang_code": "e", "voice": "ef_dora"},
    "fr": {"lang_code": "f", "voice": "ff_siwis"},
}


def load_items(lang):
    if not os.path.exists(MANIFEST):
        sys.exit(f"Manifest not found: {MANIFEST} -- run `npm run tts:manifest` first.")
    with open(MANIFEST, encoding="utf-8") as f:
        data = json.load(f)
    items = data.get(lang, [])
    if not items:
        sys.exit(f"No items for language '{lang}' in {MANIFEST}")
    return items


def out_path_for(lang, item_id):
    slug = item_id.split("-", 1)[1] if "-" in item_id else item_id
    return os.path.join(ROOT, "assets", "audio", lang, f"{slug}.wav")


def gen_kokoro(lang, items, voice, force):
    try:
        import numpy as np
        import soundfile as sf
        from kokoro import KPipeline
    except Exception as e:
        sys.exit(
            "Kokoro not available. Install:  pip install kokoro soundfile misaki[en]\n"
            "You also need the espeak-ng system package (see README).\n"
            f"Import error: {e}"
        )
    cfg = KOKORO[lang]
    pipeline = KPipeline(lang_code=cfg["lang_code"])
    voice = voice or cfg["voice"]
    done = skipped = failed = 0
    for it in items:
        text, iid = it["text"], it["id"]
        path = out_path_for(lang, iid)
        if os.path.exists(path) and not force:
            skipped += 1
            continue
        try:
            chunks = [audio for (_gs, _ps, audio) in pipeline(text, voice=voice, speed=1, split_pattern=r"\n+")]
            if not chunks:
                raise RuntimeError("no audio produced")
            audio = chunks[0] if len(chunks) == 1 else np.concatenate(chunks)
            sf.write(path, audio, 24000)
            done += 1
            print(f"  ok {iid} -> {os.path.relpath(path, ROOT)}")
        except Exception as e:
            failed += 1
            print(f"  FAIL {iid}: {e}")
    return done, skipped, failed


def gen_chatterbox(lang, items, speaker, gpu, force):
    try:
        import torch
        import torchaudio
        from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    except Exception as e:
        sys.exit(
            "Chatterbox not available. Install:  pip install chatterbox-tts\n"
            "(The multilingual API can vary by version -- check the installed package.)\n"
            f"Import error: {e}"
        )
    if speaker and not os.path.exists(speaker):
        sys.exit(f"Reference voice not found: {speaker}")
    device = "cuda" if (gpu and torch.cuda.is_available()) else "cpu"
    print(f"  loading Chatterbox multilingual on {device} ...")
    model = ChatterboxMultilingualTTS.from_pretrained(device=device)
    done = skipped = failed = 0
    for it in items:
        text, iid = it["text"], it["id"]
        path = out_path_for(lang, iid)
        if os.path.exists(path) and not force:
            skipped += 1
            continue
        try:
            wav = model.generate(text, language_id=lang, audio_prompt_path=speaker)
            wav = wav.cpu()
            if wav.dim() == 1:
                wav = wav.unsqueeze(0)
            torchaudio.save(path, wav, model.sr)
            done += 1
            print(f"  ok {iid} -> {os.path.relpath(path, ROOT)}")
        except Exception as e:
            failed += 1
            print(f"  FAIL {iid}: {e}")
    return done, skipped, failed


def main():
    ap = argparse.ArgumentParser(description="Generate voice files with Kokoro or Chatterbox.")
    ap.add_argument("--engine", required=True, choices=["kokoro", "chatterbox"])
    ap.add_argument("--lang", required=True, choices=["es", "fr", "pl"])
    ap.add_argument("--voice", help="Kokoro built-in voice (default chosen per language)")
    ap.add_argument("--speaker", help="Chatterbox reference clip (.wav) for voice cloning")
    ap.add_argument("--gpu", action="store_true", help="use CUDA if available (Chatterbox)")
    ap.add_argument("--force", action="store_true", help="overwrite existing files")
    args = ap.parse_args()

    items = load_items(args.lang)
    os.makedirs(os.path.join(ROOT, "assets", "audio", args.lang), exist_ok=True)
    print(f"Engine={args.engine} lang={args.lang} items={len(items)}")
    if args.engine == "kokoro" and args.lang not in KOKORO:
        sys.exit(f"Kokoro does not support '{args.lang}'. Use --engine chatterbox, or rely on on-device TTS.")
    if args.engine == "kokoro":
        done, skipped, failed = gen_kokoro(args.lang, items, args.voice, args.force)
    else:
        done, skipped, failed = gen_chatterbox(args.lang, items, args.speaker, args.gpu, args.force)
    print(f"\nDone. generated={done} skipped={skipped} failed={failed}")
    print("Register them in the app with:  npm run register:audio")


if __name__ == "__main__":
    main()
