import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { buildExercise, requirePack, type ExerciseInstance, type ExerciseType } from '@/content';
import { ExercisePlayer } from '@/components/ExercisePlayer';
import { PrimaryButton } from '@/components/ui';
import { getDueItemIds } from '@/db/progress';
import { useAppStore } from '@/state/useAppStore';
import { colors, fontSize, spacing } from '@/theme';

const REVIEW_TYPES: ExerciseType[] = ['listen_match', 'image_to_text', 'text_to_image', 'pronounce'];

export default function ReviewScreen() {
  const router = useRouter();
  const languageCode = useAppStore((s) => s.languageCode);
  const refresh = useAppStore((s) => s.refresh);
  const [loading, setLoading] = useState(true);
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const ids = await getDueItemIds(languageCode);
      if (active) {
        setItemIds(ids);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [languageCode]);

  const pack = requirePack(languageCode);

  const exercises = useMemo<ExerciseInstance[]>(
    () =>
      itemIds
        .map((itemId, i) => {
          const item = pack.items[itemId];
          if (!item) return null;
          return buildExercise(pack, REVIEW_TYPES[i % REVIEW_TYPES.length], item);
        })
        .filter((e): e is ExerciseInstance => e !== null),
    [itemIds, pack]
  );

  const handleComplete = async () => {
    await refresh();
    setDone(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.text}>Loading review…</Text>
      </SafeAreaView>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.bigEmoji}>✅</Text>
        <Text style={styles.title}>All caught up!</Text>
        <Text style={styles.text}>No words are due for review right now.</Text>
        <PrimaryButton label="Back to home" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.bigEmoji}>🔁</Text>
        <Text style={styles.title}>Review complete!</Text>
        <Text style={styles.text}>Your review schedule has been updated.</Text>
        <PrimaryButton label="Back to home" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <PrimaryButton label="‹ Exit" tone="neutral" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Review</Text>
      </View>
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
    gap: spacing(3),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing(4),
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  bigEmoji: { fontSize: 64 },
  title: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  text: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },
});
