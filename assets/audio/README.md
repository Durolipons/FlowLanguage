# Audio (per-language recordings)

Optional native-speaker recordings. Filenames match the item id without its
language prefix: item `es-agua` → `es/agua.wav` (or `.mp3`, etc.).

```
assets/audio/
  es/   agua.wav  pan.wav ...
  fr/   eau.wav   pain.wav ...
```

**How playback works** (`src/audio/player.ts` → `playItemAudio`):
1. If the item has a bundled recording registered in
   `src/content/assets/audioAssets.ts`, it plays that (via `expo-audio`).
2. Else if the item has a remote `audio` URL, it plays that.
3. Otherwise it falls back to on-device **text-to-speech**.

By default `audioAssets.ts` is **empty**, so everything uses TTS (which sounds
good and needs no files).

To test the recorded-audio path, run `npm run gen:audio` — it drops short
**placeholder tones** and wires them up. Replace them with real recordings
(keeping the same filenames), or clear `audioAssets.ts` to return to TTS.

To add your own recordings manually, drop files in `assets/audio/<lang>/` and
add one line per item to `audioAssets.ts`, e.g.:
`'es-agua': require('../../../assets/audio/es/agua.mp3'),`
