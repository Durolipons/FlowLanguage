import type { AudioSource } from 'expo-audio';

// Bundled recordings. Metro requires static `require()` paths, so add one line
// per recording you drop into assets/audio/<lang>/. Example:
//   'es-agua': require('../../../assets/audio/es/agua.mp3'),
// When an item has no entry here (and no `audio` URL on the item), playback
// falls back to on-device text-to-speech. See scripts/generate-audio-placeholders.mjs.
export const audioAssets: Record<string, AudioSource> = {};

export function getAudioAsset(itemId: string): AudioSource | undefined {
  return audioAssets[itemId];
}
