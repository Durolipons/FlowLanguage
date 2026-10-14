/**
 * Content schema for the language-learning app.
 *
 * The design is "data-driven": each language is a `LanguagePack` containing
 * lexical items and a unit/lesson structure. Exercise instances are generated
 * automatically from a lesson's items (see `src/content/engine.ts`), so adding
 * content only requires vocabulary — no per-exercise wiring.
 */

export type ExerciseType =
  | 'listen_match' // hear the word -> pick the matching image
  | 'text_to_image' // see the word -> pick the matching image
  | 'image_to_text' // see the image -> pick the matching word
  | 'pronounce' // hear it, then repeat it aloud (speech recognition)
  | 'build_sentence'; // arrange word tiles into the correct phrase

/** Writing system the pack's target text uses. Drives normalization + tokenization. */
export type Script = 'latin' | 'arabic' | 'cjk';

/** Text direction for the pack's target script. */
export type Direction = 'ltr' | 'rtl';

/** How the pack's pronunciation aid is romanized (empty for Latin). */
export type RomanizationScheme = 'none' | 'pinyin' | 'jyutping' | 'transliteration';

/** A single word or phrase the learner studies. */
export interface LexicalItem {
  id: string;
  /** Target-language word or phrase. */
  text: string;
  /** English meaning (hidden by default — kept for review hints/future use). */
  translation: string;
  /** Emoji used as the visual cue (also acts as the "image" for matching). */
  emoji?: string;
  /** Optional bundled image asset path (takes priority over emoji when set). */
  image?: string;
  /** Optional recorded audio asset path (falls back to TTS when absent). */
  audio?: string;
  /** Optional romanized pronunciation (Pinyin, Jyutping, transliteration). */
  romanization?: string;
  /** Optional explicit word segmentation for CJK (used by build_sentence). */
  segmented?: string[];
}

/** An explicit step in a lesson (optional; lessons can auto-generate instead). */
export interface LessonPlanStep {
  itemId: string;
  types: ExerciseType[];
}

export interface Lesson {
  id: string;
  title: string;
  /** Ordered lexical item ids to teach. */
  itemIds: string[];
  /** Optional explicit exercise plan; otherwise auto-generated from itemIds. */
  plan?: LessonPlanStep[];
}

export interface Unit {
  id: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  lessons: Lesson[];
}

export interface LanguagePack {
  code: string;
  /** Name in the target language (e.g. "Español"). */
  name: string;
  /** Name in English (e.g. "Spanish"). */
  englishName: string;
  /** Flag emoji. */
  flag: string;
  /** BCP-47 locale for speech recognition (e.g. "es-ES"). */
  speechLocale: string;
  /** Language tag for text-to-speech (e.g. "es-ES"). */
  ttsLanguage: string;
  /** Writing system the target text uses (drives normalization/tokenization). */
  script: Script;
  /** Text direction for the target script (Arabic is RTL). */
  direction: Direction;
  /** How pronunciation is romanized for this pack (Pinyin, Jyutping, etc.). */
  romanizationScheme: RomanizationScheme;
  /** All lexical items keyed by id. */
  items: Record<string, LexicalItem>;
  units: Unit[];
}

/** A fully-resolved exercise the player renders. */
export interface ExerciseInstance {
  key: string;
  type: ExerciseType;
  item: LexicalItem;
  /** For matching types: the target + distractors, already shuffled. */
  choices: LexicalItem[];
}

/** A single line in a dialogue, spoken by one speaker. */
export interface DialogueTurn {
  /** Speaker id (e.g. "ana", "luis") — used for per-speaker voice assignment. */
  speaker: string;
  /** What the speaker says, in the target language. */
  text: string;
  /** Optional English gloss (hidden by default for immersion). */
  translation?: string;
  /** Optional bundled/remote audio URL (falls back to TTS when absent). */
  audio?: string;
}

/** A multi-turn conversation for listening/speaking practice. */
export interface Dialogue {
  id: string;
  title: string;
  /** Language pack code this dialogue belongs to (e.g. "es", "fr"). */
  language: string;
  emoji?: string;
  /** Distinct speaker ids in order of appearance. */
  speakers: string[];
  turns: DialogueTurn[];
}
