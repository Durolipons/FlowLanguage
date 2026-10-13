import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { allLessons, requirePack } from '@/content';
import { useAppStore } from '@/state/useAppStore';
import { Card } from '@/components/ui';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const languageCode = useAppStore((s) => s.languageCode);
  const summary = useAppStore((s) => s.summary);
  const lessonStatuses = useAppStore((s) => s.lessonStatuses);
  const dueCount = useAppStore((s) => s.dueCount);

  const pack = useMemo(() => requirePack(languageCode), [languageCode]);
  const lessons = useMemo(() => allLessons(pack), [pack]);
  const nextLesson = useMemo(
    () => lessons.find((l) => !(l.lesson.id in lessonStatuses)) ?? lessons[0],
    [lessons, lessonStatuses]
  );

  const goalMet = summary.dailyDone >= summary.dailyGoal;
  const remaining = Math.max(0, summary.dailyGoal - summary.dailyDone);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/languages')} style={styles.langPill} hitSlop={8}>
            <Text style={styles.langFlag}>{pack.flag}</Text>
            <Text style={styles.langName}>{pack.name}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>{getGreeting()}</Text>

        <Card style={styles.streakCard}>
          <View style={styles.streakRow}>
            <View style={styles.streakStat}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNum}>{summary.streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakEmoji}>⭐</Text>
              <Text style={styles.streakNum}>{summary.xp}</Text>
              <Text style={styles.streakLabel}>total XP</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.streakStat}>
              <Text style={styles.streakEmoji}>{goalMet ? '🎯' : '📚'}</Text>
              <Text style={styles.streakNum}>
                {summary.dailyDone}/{summary.dailyGoal}
              </Text>
              <Text style={styles.streakLabel}>today</Text>
            </View>
          </View>
          {!goalMet ? (
            <Text style={styles.goalHint}>
              Finish {remaining} more lesson{remaining > 1 ? 's' : ''} to hit today’s goal.
            </Text>
          ) : (
            <Text style={[styles.goalHint, { color: colors.success }]}>Daily goal complete. ¡Bien hecho!</Text>
          )}
        </Card>

        {nextLesson && (
          <Pressable
            onPress={() => router.push(`/lesson/${nextLesson.lesson.id}`)}
            style={({ pressed }) => [styles.continueCard, pressed && { opacity: 0.95 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.continueLabel}>Continue</Text>
              <Text style={styles.continueTitle}>{nextLesson.lesson.title}</Text>
              <Text style={styles.continueUnit}>{nextLesson.unitTitle}</Text>
            </View>
            <View style={styles.continuePlay}>
              <Text style={styles.continuePlayIcon}>▶</Text>
            </View>
          </Pressable>
        )}

        {dueCount > 0 && (
          <Pressable
            onPress={() => router.push('/review')}
            style={({ pressed }) => [styles.reviewCard, pressed && { opacity: 0.95 }]}
          >
            <Text style={styles.reviewEmoji}>🔁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.reviewTitle}>
                Review {dueCount} word{dueCount > 1 ? 's' : ''}
              </Text>
              <Text style={styles.reviewSub}>Reinforce what you’ve learned</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push('/dialogues')}
          style={({ pressed }) => [styles.dialogueCard, pressed && { opacity: 0.95 }]}
        >
          <Text style={styles.dialogueEmoji}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.dialogueTitle}>Dialogues</Text>
            <Text style={styles.dialogueSub}>Listen to real conversations</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Lessons</Text>
        <View style={styles.units}>
          {pack.units.map((unit) => {
            const done = unit.lessons.filter((l) => l.id in lessonStatuses).length;
            return (
              <Pressable
                key={unit.id}
                onPress={() => router.push(`/unit/${unit.id}`)}
                style={({ pressed }) => [styles.unitCard, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.unitEmoji}>{unit.emoji ?? '📘'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  <Text style={styles.unitSub}>{unit.subtitle}</Text>
                </View>
                <Text style={styles.unitCount}>
                  {done}/{unit.lessons.length}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días ☀️';
  if (h < 18) return 'Buenas tardes 🌤️';
  return 'Buenas noches 🌙';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(12), gap: spacing(4) },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  langFlag: { fontSize: 20 },
  langName: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  chevron: { fontSize: fontSize.lg, color: colors.textFaint },
  greeting: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  streakCard: { gap: spacing(3) },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakStat: { flex: 1, alignItems: 'center' },
  streakEmoji: { fontSize: 22 },
  streakNum: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text, marginTop: 2 },
  streakLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
  goalHint: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing(5),
  },
  continueLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.primarySoft,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  continueTitle: { fontSize: fontSize.xl, fontWeight: '800', color: colors.white, marginTop: 2 },
  continueUnit: { fontSize: fontSize.sm, color: colors.primarySoft, marginTop: 2 },
  continuePlay: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuePlayIcon: { color: colors.primary, fontSize: 20, marginLeft: 3 },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing(4),
  },
  reviewEmoji: { fontSize: 26 },
  reviewTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  reviewSub: { fontSize: fontSize.sm, color: colors.textMuted },
  dialogueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogueEmoji: { fontSize: 26 },
  dialogueTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  dialogueSub: { fontSize: fontSize.sm, color: colors.textMuted },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text, marginTop: spacing(2) },
  units: { gap: spacing(3) },
  unitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitEmoji: { fontSize: 30 },
  unitTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  unitSub: { fontSize: fontSize.sm, color: colors.textMuted },
  unitCount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
});

