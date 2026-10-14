/** Traveller-mode types. Entirely offline: no network, no free MT. */

/** Target language pack codes that have curated traveller phrases. */
export type TravLang = 'es' | 'fr' | 'pl' | 'ar';

export type TravCategoryCode =
  | 'airport'
  | 'hotel'
  | 'restaurant'
  | 'shopping'
  | 'emergency'
  | 'transport'
  | 'custom';

/** One curated travel phrase (translate lookup / phrasebook row / saved). */
export interface TravPhrase {
  id: string; // built-in: 'es-taxi' style (lang + slug); saved: 'saved:<n>'
  lang: TravLang; // 'es' | 'fr' | 'pl'
  text: string; // target side
  source: string; // English query this phrase answers
  category: TravCategoryCode;
  /** Short curated pronunciation gloss. Never machine-generated. */
  hint?: string;
  /** Bundled audio registry key; falls back to TTS when absent. */
  audioKey?: string;
}

/** Phrase input from content files (lang added by aggregator). */
export interface TravPhraseInput {
  id: string;
  text: string;
  source: string;
  category: TravCategoryCode;
  hint?: string;
  audioKey?: string;
}

/** How well a raw English input matched a curated phrase. */
export type MatchKind = 'exact' | 'close' | 'word' | 'none';

export interface MatchResult {
  kind: MatchKind;
  phrase: TravPhrase | null;
  /** 0..1 similarity for 'word'/'close' fallback; 1 for exact; 0 for none. */
  score: number;
}

/** One word from a target-language sentence with its English meaning. */
export interface WordMeaning {
  word: string;
  /** English gloss, or null when the word is unknown. */
  meaning: string | null;
  source: 'phrase' | 'pack' | 'none';
}

export interface TripDeck {
  id: number;
  name: string;
  lang: string;
  createdAt: number;
  active: 0 | 1;
}

export interface SavedPhrase {
  id: number;
  source: string;
  text: string;
  targetLang: string;
  category: TravCategoryCode;
  deckId: number | null;
  askedAt: number;
  savedAt: number;
  revScore: number;
  revBest: number;
}

export interface PhraseProgress {
  saveId: number;
  repetitions: number;
  intervalDays: number;
  ease: number;
  dueAt: number;
  deckId: number | null;
  correct: number;
  incorrect: number;
}
