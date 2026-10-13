# Reference voices (for XTTS-v2 voice cloning)

XTTS-v2 clones a voice from a short (~6 second) clean audio clip. Put **one
reference clip per language** here and point the generator at it:

```
voices/
  es_ref.wav    # a ~6s clip of the Spanish voice you want to clone
  fr_ref.wav    # a ~6s clip of the French voice you want to clone
```

Tips for a good reference clip:
- 6–10 seconds, single speaker, minimal background noise.
- WAV preferred (the generator passes it straight to XTTS-v2).
- Use the SAME voice consistently so every word sounds like one tutor.
- You can record yourself, or use any Creative-Commons voice sample you have
  the right to use.

These files are **not committed by default** if you don't want to ship them —
see `.gitignore`. Generation output goes to `assets/audio/<lang>/`.
