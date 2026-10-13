import { createAudioPlayer, type AudioPlayer, type AudioSource } from 'expo-audio';
import type { DialogueTurn, LexicalItem } from '@/content';
import { getAudioAsset } from '@/content/assets/audioAssets';
import { getDialogueAudioAsset } from '@/content/assets/dialogueAudio';
import { remoteAudio } from '@/content/assets/remoteAssets';
import { speak, stopSpeaking } from './tts';

let player: AudioPlayer | null = null;

interface PlayOpts {
  rate?: number;
  pitch?: number;
  onDone?: () => void;
}

function playSource(source: AudioSource | null, text: string, language: string, opts: PlayOpts) {
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
  speak(text, language, opts);
}

/**
 * Play an item's audio: bundled recording → remote URL → the item's own `audio`
 * URL → text-to-speech.
 */
export function playItemAudio(item: LexicalItem, language: string, opts: PlayOpts = {}): void {
  const source =
    getAudioAsset(item.id) ??
    (remoteAudio[item.id] ? { uri: remoteAudio[item.id] } : null) ??
    (item.audio ? { uri: item.audio } : null);
  playSource(source, item.text, language, opts);
}

/**
 * Play a dialogue turn. `audioKey` is "<dialogueId>:<turnIndex>". Falls back to
 * the turn's own `audio` URL, then text-to-speech.
 */
export function playTurnAudio(
  turn: DialogueTurn,
  language: string,
  audioKey: string,
  opts: PlayOpts = {}
): void {
  const source =
    getDialogueAudioAsset(audioKey) ??
    (remoteAudio[audioKey] ? { uri: remoteAudio[audioKey] } : null) ??
    (turn.audio ? { uri: turn.audio } : null);
  playSource(source, turn.text, language, opts);
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

