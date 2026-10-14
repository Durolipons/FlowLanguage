/**
 * Offline phrase-matching engine for Traveller Mode.
 *
 * This is NOT machine translation. It matches an English query against curated
 * travel phrases (and the language pack's vocabulary) and reports the match
 * strength honestly: exact → close → word → none.
 */
import { getPack } from '@/content';
import { getTravellerPhrases } from '@/content/traveller';
import type { MatchResult, TravLang, TravPhrase, WordMeaning } from './types';

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:()[\]{}"'«»¿¡]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Polite openers dropped before matching, so "please, where is X" still hits. */
const OPENERS = [
  'please can you',
  'can you please',
  'could you please',
  'please could you',
  'i would like',
  'i would love',
  'i need',
  'i want',
  'please',
  'can you',
  'could you',
  'would you',
];

/** Repeatedly strip leading polite openers. */
export function stripOpeners(s: string): string {
  let out = s;
  let changed = true;
  while (changed) {
    changed = false;
    for (const op of OPENERS) {
      if (out.startsWith(op + ' ')) {
        out = out.slice(op.length + 1).trim();
        changed = true;
      }
    }
  }
  return out;
}

/** Split into normalized word tokens. */
export function tokenize(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean);
}

/** Words that carry no lookup meaning. */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'am', 'be', 'been', 'to', 'of', 'in', 'on', 'at', 'for',
  'with', 'and', 'or', 'but', 'do', 'does', 'did', 'you', 'i', 'me', 'my', 'we', 'us',
  'it', 'this', 'that', 'these', 'those', 'please', 'can', 'could', 'would', 'will',
  'shall', 'may', 'might', 'must', 'there', 'here', 'what', 'where', 'when', 'how',
  'who', 'why', 'some', 'any', 'not', 'no', 'yes',
]);

/** True when a token can carry meaning in a match. */
export function isContentWord(w: string): boolean {
  return w.length > 1 && !STOPWORDS.has(w);
}

/** Levenshtein edit distance. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[n];
}

/** Similarity 0..1 from Levenshtein distance. */
function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  return maxLen === 0 ? 1 : 1 - levenshtein(a, b) / maxLen;
}

/** Shared content words between two token lists. */
function sharedContentWords(a: string[], b: string[]): string[] {
  const setB = new Set(b.filter(isContentWord));
  return a.filter((w) => setB.has(w) && isContentWord(w));
}

/**
 * Match an English query against the curated phrasebook for `lang`.
 *
 * Order: exact (normalized, openers dropped) → close (high similarity or
 * 3+ shared words with at least one content word) → word (any shared content
 * word) → none.
 */
export function matchPhrase(query: string, lang: TravLang): MatchResult {
  const phrases = getTravellerPhrases(lang);
  const raw = normalize(query);
  const stripped = stripOpeners(raw);
  if (!raw) return { kind: 'none', phrase: null, score: 0 };

  // 1. Exact match against the curated English source.
  for (const phrase of phrases) {
    const src = normalize(phrase.source);
    if (src === raw || src === stripped) {
      return { kind: 'exact', phrase, score: 1 };
    }
  }

  const queryWords = tokenize(stripped || raw);

  // 2. Close match — best of string similarity and word overlap.
  let best: { phrase: TravPhrase; score: number } | null = null;
  for (const phrase of phrases) {
    const src = normalize(phrase.source);
    const sim = Math.max(similarity(stripped, src), similarity(raw, src));
    const phraseWords = tokenize(phrase.source);
    const shared = sharedContentWords(queryWords, phraseWords);
    const overlap = queryWords.length ? shared.length / queryWords.length : 0;

    const strongOverlap = shared.length >= 3 || (shared.length >= 1 && overlap >= 0.6);
    if (sim >= 0.8 || strongOverlap) {
      const score = Math.max(sim, overlap);
      if (!best || score > best.score) best = { phrase, score };
    }
  }
  if (best) {
    return { kind: 'close', phrase: best.phrase, score: Math.min(1, best.score) };
  }

  // 3. Word match — at least one shared content word.
  let bestWord: { phrase: TravPhrase; score: number } | null = null;
  for (const phrase of phrases) {
    const shared = sharedContentWords(queryWords, tokenize(phrase.source));
    if (shared.length > 0) {
      const score = shared.length / Math.max(1, queryWords.length);
      if (!bestWord || score > bestWord.score) bestWord = { phrase, score };
    }
  }
  if (bestWord) {
    return { kind: 'word', phrase: bestWord.phrase, score: bestWord.score };
  }

  // 4. Nothing in the phrasebook answers this.
  return { kind: 'none', phrase: null, score: 0 };
}

/** Look up a single word/phrase against curated phrases, then the language pack. */
export function lookupWord(query: string, lang: TravLang): MatchResult | null {
  const phrases = getTravellerPhrases(lang);
  const q = normalize(query);
  if (!q) return null;

  for (const phrase of phrases) {
    if (normalize(phrase.source) === q) return { kind: 'exact', phrase, score: 1 };
  }
  for (const phrase of phrases) {
    if (tokenize(phrase.source).includes(q)) return { kind: 'word', phrase, score: 1 };
  }

  const pack = getPack(lang);
  if (pack) {
    for (const item of Object.values(pack.items)) {
      if (normalize(item.translation) === q || normalize(item.text) === q) {
        const synth: TravPhrase = {
          id: `word:${item.id}`,
          lang,
          text: item.text,
          source: item.translation,
          category: 'custom',
        };
        return { kind: 'word', phrase: synth, score: 1 };
      }
    }
  }
  return null;
}

/**
 * Decompose a target-language sentence into per-word English meanings.
 * Sources, in order: language-pack item → curated phrase containing the word →
 * unknown (rendered as "—" by the UI). Nothing is guessed.
 */
export function decomposeQuery(targetText: string, lang: TravLang): WordMeaning[] {
  const pack = getPack(lang);
  const phrases = getTravellerPhrases(lang);
  const items = pack ? Object.values(pack.items) : [];

  const seen = new Set<string>();
  const out: WordMeaning[] = [];

  for (const word of tokenize(targetText)) {
    if (seen.has(word)) continue;
    seen.add(word);

    // 1. Exact pack item ("taxi" -> "taxi").
    const exact = items.find((i) => normalize(i.text) === word);
    if (exact) {
      out.push({ word, meaning: exact.translation, source: 'pack' });
      continue;
    }

    // 2. Pack item that contains the word ("necesito" inside a phrase item).
    const containing = items.find((i) => tokenize(i.text).includes(word));
    if (containing) {
      out.push({ word, meaning: containing.translation, source: 'pack' });
      continue;
    }

    // 3. Curated phrase that contains the word — the phrase's English source
    //    is the closest honest gloss we have.
    const phrase = phrases.find((p) => tokenize(p.text).includes(word));
    if (phrase) {
      out.push({ word, meaning: phrase.source, source: 'phrase' });
      continue;
    }

    out.push({ word, meaning: null, source: 'none' });
  }

  return out;
}

/** Human label for a match kind (used by the result badge). */
export function matchKindLabel(kind: MatchResult['kind']): string {
  switch (kind) {
    case 'exact':
      return 'Exact match';
    case 'close':
      return 'Close match';
    case 'word':
      return 'Related phrase';
    default:
      return 'No match';
  }
}
