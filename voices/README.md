# Reference voices (for Chatterbox voice cloning)

Chatterbox clones a voice from a short (~6 second) clean audio clip. Put one
reference clip per language here and pass it with `--speaker`:

```
voices/
  es_ref.wav    # a ~6s clip of the Spanish voice you want to clone
  fr_ref.wav    # a ~6s clip of the French voice you want to clone
```

Tips:
- 6–10 seconds, single speaker, minimal background noise, WAV preferred.
- Use the SAME voice consistently so every word sounds like one tutor.
- Record yourself, or use any voice sample you have the right to use.

**Not needed for Kokoro** — it uses built-in voices (override with `--voice`).

These files are git-ignored by default (personal / possibly large). Generation
output goes to `assets/audio/<lang>/`.
