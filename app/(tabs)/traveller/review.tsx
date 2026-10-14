import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrimaryButton, ProgressBar } from '@/components/ui';
import { AudioButton, EmptyState, TravHeader } from '@/components/traveller';
import { getDuePhrases, recordPhraseReview, type SavedPhraseRow } from '@/db/progress';
import { useActiveTrip, useTravellerLang } from '@/traveller/useTraveller';
import { colors, fontSize, radius, spacing } from '@/theme';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

type Rating = 'easy' | 'medium' | 'hard';

export default function TripReviewScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();

  const [queue, setQueue] = useState<SavedPhraseRow[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const due = await getDuePhrases(trip ? trip.id : null);
    const forLang = trip ? due : due.filter((p) => p.targetLang === lang);
    setQueue(forLang);
    setIndex(0);
    setRevealed(false);
    setReviewed(0);
    setDone(false);
    setLoading(false);
  }, [trip, lang]);

  useEffect(() => {
    void load();
  }, [load]);

  const current = queue[index];

  const grade = async (rating: Rating) => {
    if (!current) return;
    await recordPhraseReview(current.id, rating);
    setReviewed((n) => n + 1);
    setRevealed(false);
    if (index + 1 >= queue.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.body}>Loading your deck…</Text>
      </SafeAreaView>
    );
  }

  if (queue.length === 0 || done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TravHeader title="Review" subtitle="Trip deck" onBack={() => router.back()} />
        <View style={styles.center}>
          <EmptyState
            emoji={done ? '🎉' : '✅'}
            title={done ? `Session complete — ${reviewed} reviewed` : 'All caught up!'}
            text={
              done
                ? 'Your phrase review schedule has been updated.'
                : trip
                ? `Nothing is due in “${trip.name}” right now. Save phrases from Translate or the Phrasebook.`
                : 'No saved phrases are due for review. Create a trip deck and save phrases.'
            }
          />
          <PrimaryButton label="Back to Traveller" onPress={() => router.replace('/traveller')} />
          <PrimaryButton
            label="Manage trip decks"
            tone="neutral"
            onPress={() => router.push('/traveller/trips')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Review"
        subtitle={trip ? trip.name : `${pack.flag} ${pack.name} saved phrases`}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {index + 1}/{queue.length}
          </Text>
          <View style={{ flex: 1 }}>
            <ProgressBar progress={(index + (revealed ? 0.5 : 0)) / queue.length} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.promptLabel}>How do you say…</Text>
          <Text style={styles.prompt}>{current.source}</Text>

          {revealed ? (
            <>
              <Text style={styles.arrow}>↓</Text>
              <Text style={[styles.answer, rtlTextStyle(containsArabic(current.text))]}>{current.text}</Text>
              <View style={styles.answerActions}>
                <AudioButton
                  text={current.text}
                  language={pack.ttsLanguage}
                  label="Play the phrase aloud"
                />
                <Text style={styles.category}>{current.category}</Text>
              </View>
            </>
          ) : (
            <PrimaryButton label="Reveal answer" onPress={() => setRevealed(true)} />
          )}
        </View>

        {revealed ? (
          <>
            <Text style={styles.rateLabel}>How well did you know it?</Text>
            <View style={styles.rateRow}>
              <PrimaryButton
                label="Hard"
                tone="danger"
                onPress={() => void grade('hard')}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Medium"
                tone="neutral"
                onPress={() => void grade('medium')}
                style={{ flex: 1 }}
              />
              <PrimaryButton
                label="Easy"
                tone="success"
                onPress={() => void grade('easy')}
                style={{ flex: 1 }}
              />
            </View>
            <Text style={styles.footnote}>
              Hard resets the interval, Medium keeps it short, Easy grows it — the same
              SM-2 scheduling your word reviews use.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    padding: spacing(5),
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: spacing(3),
  },
  body: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  progressLabel: { fontSize: fontSize.sm, fontWeight: '800', color: colors.textMuted },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(5),
    gap: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  prompt: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  arrow: { fontSize: fontSize.md, color: colors.textFaint, textAlign: 'center' },
  answer: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  answerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  category: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  rateLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  rateRow: { flexDirection: 'row', gap: spacing(2) },
  footnote: { fontSize: fontSize.xs, color: colors.textFaint, lineHeight: 17 },
});
