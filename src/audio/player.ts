import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';
import type { LexicalItem } from '@/content';
import { getAudioAsset } from '@/content/assets/audioAssets';
import { remoteAudio } from '@/content/assets/remoteAssets';
import { speak, stopSpeaking } from './tts';

let player: AudioPlayer | null = null;

/** Resolve the best audio source for an item: bundled file → remote URL → null. */
function resolveSource(item: LexicalItem): AudioSource | null {
  const bundled = getAudioAsset(item.id);
  if (bundled != null) return bundled;
  const remote = remoteAudio[item.id];
  if (remote) return { uri: remote };
  if (item.audio) return { uri: item.audio };
  return null;
}

/**
 * Play an item's audio. Uses a bundled recording or the item's remote `audio`
 * URL when available; otherwise falls back to text-to-speech.
 */
export function playItemAudio(
  item: LexicalItem,
  language: string,
  opts: { rate?: number; pitch?: number; onDone?: () => void } = {}
): void {
  const source = resolveSource(item);
  if (source != null) {
    try {
      stopSpeaking();
      if (!player) player = createAudioPlayer(source);
      else player.replace(source);
      player.play();
      return;
    } catch {
      /* fall through to TTS on any playback error */
    }
  }
  speak(item.text, language, opts);
}

/** Stop whatever is currently playing (recorded audio and/or TTS). */
export function stopItemAudio(): void {
  try {
    player?.pause();
  } catch {
    /* ignore */
  }
  stopSpeaking();
}
