import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState, CategoryChip, PhraseRow, TravHeader } from '@/components/traveller';
import { getTravellerPhrases } from '@/content/traveller';
import { CATEGORY_IDS } from '@/traveller/categories';
import { normalize } from '@/traveller/translate';
import { useActiveTrip, useSavedPhrases, useTravellerLang } from '@/traveller/useTraveller';
import type { TravCategoryCode, TravPhrase } from '@/traveller/types';
import { colors, fontSize, radius, spacing } from '@/theme';

type Filter = 'all' | TravCategoryCode;

export default function PhrasebookScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const { saved, isSaved, toggle } = useSavedPhrases(lang);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const curated = useMemo(() => getTravellerPhrases(lang), [lang]);

  /** Saved phrases presented as Custom-category entries. */
  const customPhrases = useMemo<TravPhrase[]>(
    () =>
      saved.map((s) => ({
        id: `saved:${s.id}`,
        lang,
        text: s.text,
        source: s.source,
        category: 'custom' as TravCategoryCode,
      })),
    [saved, lang]
  );

  const matches = (p: TravPhrase) => {
    const q = normalize(query);
    if (!q) return true;
    return normalize(p.text).includes(q) || normalize(p.source).includes(q);
  };

  const list = useMemo(() => {
    if (filter === 'custom') return customPhrases.filter(matches);
    if (filter === 'all') {
      return [...customPhrases.filter(matches), ...curated.filter(matches)];
    }
    return curated.filter((p) => p.category === filter && matches(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query, curated, customPhrases]);

  const countFor = (code: Filter) => {
    if (code === 'all') return customPhrases.length + curated.length;
    if (code === 'custom') return customPhrases.length;
    return curated.filter((p) => p.category === code).length;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Phrasebook"
        subtitle={`${pack.flag} ${pack.name} · ${curated.length} curated phrases`}
        onBack={() => router.back()}
      />

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search phrases…"
          placeholderTextColor={colors.textFaint}
          style={styles.search}
          accessibilityLabel="Search the phrasebook"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <CategoryChip
          code="custom"
          label="All"
          emoji="📚"
          selected={filter === 'all'}
          count={countFor('all')}
          onPress={() => setFilter('all')}
        />
        {CATEGORY_IDS.map((code) => (
          <CategoryChip
            key={code}
            code={code}
            selected={filter === code}
            count={countFor(code)}
            onPress={() => setFilter(code)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <EmptyState
            emoji="📖"
            title="No phrases found"
            text={
              filter === 'custom'
                ? 'Save phrases from Translate or Speak and they will appear here.'
                : 'Try a different search or category.'
            }
          />
        ) : (
          list.map((p) => (
            <PhraseRow
              key={p.id}
              phrase={p}
              ttsLanguage={pack.ttsLanguage}
              saved={isSaved(p.source, p.text)}
              onSave={() => void toggle(p, trip?.id ?? null)}
              onPress={() =>
                router.push({
                  pathname: '/traveller/learn',
                  params: { text: p.text, translation: p.source },
                })
              }
            />
          ))
        )}
        <Text style={styles.footnote}>
          {filter === 'all' && customPhrases.length > 0
            ? `⭐ ${customPhrases.length} saved phrase${customPhrases.length > 1 ? 's' : ''} shown first.`
            : 'Everything here is bundled with the app and works offline.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { paddingHorizontal: spacing(4) },
  search: {
    minHeight: 48,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    fontSize: fontSize.md,
    color: colors.text,
  },
  chips: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    gap: spacing(2),
  },
  list: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(2) },
  footnote: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing(2),
  },
});
