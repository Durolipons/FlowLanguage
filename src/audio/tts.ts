import * as Speech from 'expo-speech';

let currentLanguage = 'es-ES';

export function setTtsLanguage(lang: string) {
  currentLanguage = lang;
}

export function getTtsLanguage(): string {
  return currentLanguage;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  onDone?: () => void;
}

/** Speak text aloud, stopping anything currently being spoken. */
export function speak(text: string, language?: string, opts: SpeakOptions = {}) {
  Speech.stop();
  Speech.speak(text, {
    language: language ?? currentLanguage,
    rate: opts.rate ?? 0.9,
    pitch: opts.pitch ?? 1.0,
    onDone: opts.onDone,
  });
}

export function stopSpeaking() {
  Speech.stop();
}
