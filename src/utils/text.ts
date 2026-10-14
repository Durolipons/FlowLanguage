import type { Script } from '@/content/schema';

/** Normalize text for lenient comparison (accents/case/punctuation-insensitive). */
export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Arabic-specific normalization: strip tashkeel/tatweel and fold the common
 * alef/hamza/teh-marbuta/alef-maqsura variants so that spelling differences
 * that don't change pronunciation still match.
 */
function normalizeArabic(s: string): string {
  return s
    .replace(/[\u0640\u064B-\u065F\u0670]/g, '') // tatweel + harakat/tashkeel + superscript alef
    .replace(/[\u0622\u0623\u0625\u0671-\u0673]/g, '\u0627') // alef variants -> alef
    .replace(/\u0624/g, '\u0648') // waw-hamza -> waw
    .replace(/\u0626/g, '\u064A') // yeh-hamza -> yeh
    .replace(/\u0629/g, '\u0647') // teh-marbuta -> heh
    .replace(/\u0649/g, '\u064A') // alef-maqsura -> yeh
    .toLowerCase();
}

/** Punctuation stripped during normalization (Latin + Arabic). */
const PUNCT_RE = /[.,!?;:¿¡"'`´()\u060C\u061B\u061F\u06D4]/g;
/** Non-global twin for per-character tests (avoids global-regex lastIndex state). */
const PUNCT_TEST = /[.,!?;:¿¡"'`´()\u060C\u061B\u061F\u06D4]/;

/** Normalize a phrase for comparison, script-aware. */
export function normalizeText(s: string, script: Script = 'latin'): string {
  const base = script === 'arabic' ? normalizeArabic(s) : stripAccents(s).toLowerCase();
  return base.replace(PUNCT_RE, '').replace(/\s+/g, ' ').trim();
}

/**
 * Split a phrase into clean tokens, preserving order.
 * CJK has no spaces, so it splits by character; others split on whitespace.
 */
export function tokenize(text: string, script: Script = 'latin'): string[] {
  if (script === 'cjk') {
    return Array.from(text).filter((ch) => /\S/.test(ch) && !PUNCT_TEST.test(ch));
  }
  return text
    .split(/\s+/)
    .map((t) => t.replace(PUNCT_RE, ''))
    .filter((t) => t.length > 0);
}

/** Compare two phrases ignoring accents, case and punctuation. */
export function phrasesMatch(a: string, b: string, script: Script = 'latin'): boolean {
  return normalizeText(a, script) === normalizeText(b, script);
}

/** Compare two phrases token-by-token (used for build-sentence). */
export function tokensMatch(a: string[], b: string[], script: Script = 'latin'): boolean {
  const na = a.map((t) => normalizeText(t, script)).filter(Boolean);
  const nb = b.map((t) => normalizeText(t, script)).filter(Boolean);
  if (na.length !== nb.length) return false;
  return na.every((t, i) => t === nb[i]);
}
