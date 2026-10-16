import type { TravPhrase, TravPhraseInput, TravLang } from '@/traveller/types';
import { esTravellerPhrases } from './traveller-es';
import { frTravellerPhrases } from './traveller-fr';
import { plTravellerPhrases } from './traveller-pl';
import { arTravellerPhrases } from './traveller-ar';
import { csTravellerPhrases } from './traveller-cs';

/** Languages that have curated traveller phrases. */
export const TRAV_LANGS: TravLang[] = ['es', 'fr', 'pl', 'ar', 'cs'];

/** Convert phrase inputs to full phrases by adding lang. */
function withLang(phrases: TravPhraseInput[], lang: TravLang): TravPhrase[] {
  return phrases.map((p) => ({ ...p, lang }));
}

/** All traveller phrases by language. */
export const travellerPhrasesByLang: Record<TravLang, TravPhrase[]> = {
  es: withLang(esTravellerPhrases, 'es'),
  fr: withLang(frTravellerPhrases, 'fr'),
  pl: withLang(plTravellerPhrases, 'pl'),
  ar: withLang(arTravellerPhrases, 'ar'),
  cs: withLang(csTravellerPhrases, 'cs'),
};

/** True when a language pack code has curated traveller phrases. */
export function hasTravellerPhrases(lang: string): lang is TravLang {
  return (TRAV_LANGS as string[]).includes(lang);
}

/** Get phrases for a specific language. */
export function getTravellerPhrases(lang: TravLang): TravPhrase[] {
  return travellerPhrasesByLang[lang] ?? [];
}

/** Get all phrases across all languages. */
export function getAllTravellerPhrases(): TravPhrase[] {
  return TRAV_LANGS.flatMap((l) => travellerPhrasesByLang[l]);
}
