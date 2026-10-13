import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { requirePack } from '@/content';
import { useAppStore } from '@/state/useAppStore';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function UnitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const languageCode = useAppStore((s) => s.languageCode);
  const lessonStatuses = useAppStore((s) => s.lessonStatuses);

  const pack = requirePack(languageCode);
  const unit = pack.units.find((u) => u.id === id);

  if (!unit) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.missing}>Unit not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Text style={styles.backIcon}>‹ Back</Text>
        </Pressable>

        <View style={styles.unitHeader}>
          <Text style={styles.unitEmoji}>{unit.emoji ?? '📘'}</Text>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          {unit.subtitle && <Text style={styles.unitSub}>{unit.subtitle}</Text>}
        </View>

        <View style={styles.lessons}>
          {unit.lessons.map((lesson, i) => {
            const status = lessonStatuses[lesson.id];
            return (
              <Pressable
                key={lesson.id}
                onPress={() => router.push(`/lesson/${lesson.id}`)}
                style={({ pressed }) => [styles.lessonRow, pressed && { opacity: 0.92 }]}
              >
                <View style={[styles.badge, status && styles.badgeDone]}>
                  {status ? <Text style={styles.badgeCheck}>✓</Text> : <Text style={styles.badgeNum}>{i + 1}</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  <Text style={styles.lessonMeta}>
                    {status ? `Completed · ${status.score}/${status.total} correct` : 'Not started'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), gap: spacing(4) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(3) },
  missing: { fontSize: fontSize.lg, color: colors.textMuted },
  link: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  back: { alignSelf: 'flex-start' },
  backIcon: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  unitHeader: { alignItems: 'center', gap: spacing(1), paddingVertical: spacing(4) },
  unitEmoji: { fontSize: 56 },
  unitTitle: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  unitSub: { fontSize: fontSize.md, color: colors.textMuted },
  lessons: { gap: spacing(3) },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  badgeDone: { backgroundColor: colors.successSoft },
  badgeNum: { fontSize: fontSize.md, fontWeight: '800', color: colors.primary },
  badgeCheck: { fontSize: fontSize.lg, fontWeight: '800', color: colors.success },
  lessonTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  lessonMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: fontSize.xl, color: colors.textFaint },
});
