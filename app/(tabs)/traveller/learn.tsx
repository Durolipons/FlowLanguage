import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PrimaryButton } from '@/components/ui';
import { AudioButton, TravHeader } from '@/components/traveller';
import { useActiveTrip, useSavedPhrases, useTravellerLang } from '@/traveller/useTraveller';
import { decomposeQuery, normalize } from '@/traveller/translate';
import type { TravCategoryCode, TravPhrase } from '@/traveller/types';
import { colors, fontSize, radius, spacing } from '@/theme';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

export default function LearnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ text?: string; translation?: string }>();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const { isSaved, toggle } = useSavedPhrases(lang);

  const text = (params.text ?? '').toString();
  const translation = (params.translation ?? '').toString();

  const words = useMemo(() => decomposeQuery(text, lang), [text, lang]);
  const known = words.filter((w) => w.meaning !== null);

  /** Find the lesson that teaches a given target-language word, if any. */
  const lessonFor = (word: string): { id: string; title: string } | null => {
    const norm = normalize(word);
    const item = Object.values(pack.items).find((i) => normalize(i.text) === norm);
    if (!item) return null;
    for (const unit of pack.units) {
      for (const lesson of unit.lessons) {
        if (lesson.itemIds.includes(item.id)) {
          return { id: lesson.id, title: lesson.title };
        }
      }
    }
    return null;
  };

  const phrase: TravPhrase = {
    id: `learn:${text}`,
    lang,
    text,
    source: translation || text,
    category: 'custom' as TravCategoryCode,
  };

  const firstLesson = known.length > 0 ? lessonFor(known[0].word) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader title="Learn This" subtitle="Word by word" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.sentenceCard}>
          <Text style={[styles.sentence, rtlTextStyle(containsArabic(text))]}>{text}</Text>
          {translation ? <Text style={styles.sentenceEn}>{translation}</Text> : null}
          <View style={styles.sentenceActions}>
            <AudioButton text={text} language={pack.ttsLanguage} label="Play the full phrase" />
            <PrimaryButton
              label={isSaved(phrase.source, phrase.text) ? 'Saved ⭐' : 'Save Vocabulary'}
              tone={isSaved(phrase.source, phrase.text) ? 'success' : 'primary'}
              onPress={() => void toggle(phrase, trip?.id ?? null)}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Word components</Text>
        <Text style={styles.sectionSub}>
          {known.length} of {words.length} words are in your {pack.name} vocabulary.
          Unknown words show “—” — we never guess a meaning.
        </Text>

        <View style={styles.wordList}>
          {words.map((w) => {
            const lesson = w.meaning ? lessonFor(w.word) : null;
            return (
              <View key={w.word} style={styles.wordRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.wordTarget, rtlTextStyle(containsArabic(w.word))]}>{w.word}</Text>
                  <Text style={styles.wordMeaning}>{w.meaning ?? '—'}</Text>
                  {w.meaning ? (
                    <Text style={styles.wordSource}>
                      {w.source === 'pack' ? 'From your vocabulary' : 'From a travel phrase'}
                    </Text>
                  ) : null}
                </View>
                {lesson ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open lesson ${lesson.title}`}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                    style={({ pressed }) => [styles.lessonBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.lessonBtnText}>Lesson ›</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        <PrimaryButton
          label={firstLesson ? `Start Practice · ${firstLesson.title}` : 'Start Practice'}
          onPress={() => {
            if (firstLesson) {
              router.push(`/lesson/${firstLesson.id}`);
            } else {
              const anyLesson = pack.units[0]?.lessons[0];
              if (anyLesson) router.push(`/lesson/${anyLesson.id}`);
              else router.push('/');
            }
          }}
        />
        <Text style={styles.footnote}>
          Practice opens a normal lesson from your {pack.name} pack, so progress and SRS
          stay in one place.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  sentenceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  sentence: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  sentenceEn: { fontSize: fontSize.md, color: colors.textMuted },
  sentenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  sectionSub: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  wordList: { gap: spacing(2) },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 64,
  },
  wordTarget: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  wordMeaning: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  wordSource: { fontSize: fontSize.xs, color: colors.textFaint, marginTop: 2 },
  lessonBtn: {
    minHeight: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing(3),
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonBtnText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.primaryDark },
  footnote: { fontSize: fontSize.xs, color: colors.textFaint, lineHeight: 17 },
});