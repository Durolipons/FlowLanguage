/** Normalize text for lenient comparison (accents/case/punctuation-insensitive). */
export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function normalizeText(s: string): string {
  return stripAccents(s)
    .toLowerCase()
    .replace(/[.,!?;:¿¡"'`´()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Split a phrase into clean tokens, preserving order (punctuation removed). */
export function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map((t) => t.replace(/[.,!?;:¿¡"'`´()]/g, ''))
    .filter((t) => t.length > 0);
}

/** Compare two phrases ignoring accents, case and punctuation. */
export function phrasesMatch(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

/** Compare two phrases token-by-token (used for build-sentence). */
export function tokensMatch(a: string[], b: string[]): boolean {
  const na = a.map(normalizeText).filter(Boolean);
  const nb = b.map(normalizeText).filter(Boolean);
  if (na.length !== nb.length) return false;
  return na.every((t, i) => t === nb[i]);
}
