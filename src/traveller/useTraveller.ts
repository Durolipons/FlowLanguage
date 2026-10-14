/**
 * Shared Traveller Mode state hooks: active language, saved phrases and the
 * active trip deck. Keeps the screens thin and the DB access in one place.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { requirePack, type LanguagePack } from '@/content';
import { hasTravellerPhrases } from '@/content/traveller';
import {
  deleteSavedPhrase,
  findSavedPhrase,
  getActiveTrip,
  getSavedPhrasesForLang,
  savePhrase,
  setActiveTrip,
  type SavedPhraseRow,
  type Trip,
} from '@/db/progress';
import { useAppStore } from '@/state/useAppStore';
import type { TravCategoryCode, TravLang, TravPhrase } from './types';

/** Resolve the Traveller target language from the active learning language. */
export function useTravellerLang(): {
  lang: TravLang;
  pack: LanguagePack;
  supported: boolean;
} {
  const languageCode = useAppStore((s) => s.languageCode);
  const pack = requirePack(languageCode);
  const supported = hasTravellerPhrases(languageCode);
  const lang = (supported ? languageCode : 'es') as TravLang;
  return { lang, pack, supported };
}

/** Saved phrases for a language, plus a fast "is this saved?" lookup. */
export function useSavedPhrases(lang: string) {
  const [saved, setSaved] = useState<SavedPhraseRow[]>([]);
  const [savedIds, setSavedIds] = useState<Map<string, number>>(new Map());
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const rows = await getSavedPhrasesForLang(lang);
    setSaved(rows);
    const map = new Map<string, number>();
    for (const r of rows) map.set(key(r.source, r.text), r.id);
    setSavedIds(map);
    setLoaded(true);
  }, [lang]);

  // Reload on focus so saves made on other screens show up immediately.
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const isSaved = useCallback(
    (source: string, text: string) => savedIds.has(key(source, text)),
    [savedIds]
  );

  /** Save or unsave a phrase; attaches it to the active trip deck when saving. */
  const toggle = useCallback(
    async (phrase: TravPhrase, deckId: number | null) => {
      const existing = await findSavedPhrase(phrase.source, phrase.text, lang);
      if (existing !== null) {
        await deleteSavedPhrase(existing);
      } else {
        await savePhrase(
          phrase.source,
          phrase.text,
          lang,
          phrase.category as TravCategoryCode,
          deckId,
          Date.now()
        );
      }
      await reload();
    },
    [lang, reload]
  );

  return { saved, savedIds, isSaved, toggle, reload, loaded };
}

/** The currently active trip deck (or null), with a setter. */
export function useActiveTrip() {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const t = await getActiveTrip();
    setTrip(t);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  const select = useCallback(
    async (id: number | null) => {
      await setActiveTrip(id);
      await reload();
    },
    [reload]
  );

  return { trip, select, reload, loaded };
}

function key(source: string, text: string): string {
  return `${source}||${text}`;
}