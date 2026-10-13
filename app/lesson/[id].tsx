import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { allLessons, findLesson, lessonExercises, requirePack } from '@/content';
import { ExercisePlayer } from '@/components/ExercisePlayer';
import { PrimaryButton } from '@/components/ui';
import { useAppStore } from '@/state/useAppStore';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const languageCode = useAppStore((s) => s.languageCode);
  const completeLesson = useAppStore((s) => s.completeLesson);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const pack = requirePack(languageCode);
  const found = useMemo(() => findLesson(pack, id), [pack, id]);
  const exercises = useMemo(
    () => (found ? lessonExercises(found.lesson, pack) : []),
    [found, pack]
  );

  if (!found) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.missing}>Lesson not found.</Text>
        <PrimaryButton label="Go back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const handleComplete = async (score: number, total: number) => {
    setResult({ score, total });
    await completeLesson(found.lesson.id, score, total);
  };

  const goNext = () => {
    const lessons = allLessons(pack);
    const idx = lessons.findIndex((l) => l.lesson.id === found.lesson.id);
    const next = lessons[idx + 1];
    if (next) {
      router.replace(`/lesson/${next.lesson.id}`);
    } else {
      router.replace('/');
    }
  };

  if (result) {
    const pct = result.total ? Math.round((result.score / result.total) * 100) : 0;
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</Text>
          <Text style={styles.summaryTitle}>Lesson complete!</Text>
          <Text style={styles.summaryScore}>
            {result.score}/{result.total} · {pct}%
          </Text>
          <Text style={styles.summaryHint}>
            {pct >= 80 ? 'Excellent work — keep it up!' : 'Nice effort. Practice makes progress.'}
          </Text>
          <View style={{ gap: spacing(3), width: '100%', marginTop: spacing(4) }}>
            <PrimaryButton label="Continue →" tone="primary" onPress={goNext} />
            <PrimaryButton label="Back to lessons" tone="neutral" onPress={() => router.replace('/')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.lessonTitle}>{found.lesson.title}</Text>
      <ExercisePlayer
        exercises={exercises}
        language={languageCode}
        ttsLanguage={pack.ttsLanguage}
        speechLocale={pack.speechLocale}
        onComplete={handleComplete}
        onExit={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
    gap: spacing(4),
  },
  missing: { fontSize: fontSize.lg, color: colors.textMuted },
  lessonTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    paddingTop: spacing(5),
    paddingHorizontal: spacing(6),
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing(6),
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
  },
  summaryEmoji: { fontSize: 64 },
  summaryTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text, marginTop: spacing(2) },
  summaryScore: { fontSize: fontSize.xl, color: colors.primary, fontWeight: '700', marginTop: spacing(1) },
  summaryHint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing(2), textAlign: 'center' },
});
