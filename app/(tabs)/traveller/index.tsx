import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Card } from '@/components/ui';
import { getLastTranslation, getRecentActivity, type RecentActivity } from '@/db/progress';
import { useActiveTrip, useTravellerLang } from '@/traveller/useTraveller';
import type { LastTranslation } from '@/db/progress';
import { colors, fontSize, radius, spacing } from '@/theme';

interface Entry {
  href: string;
  emoji: string;
  title: string;
  sub: string;
}

const ENTRIES: Entry[] = [
  { href: '/traveller/translate', emoji: '🔤', title: 'Translate', sub: 'Type or speak a phrase instantly' },
  { href: '/traveller/speak', emoji: '🎤', title: 'Speak', sub: 'Translate and play aloud' },
  { href: '/traveller/phrasebook', emoji: '📖', title: 'Phrasebook', sub: 'Curated + saved travel phrases' },
  { href: '/traveller/review', emoji: '🔁', title: 'Review Trip Deck', sub: "Practice phrases you've used" },
];

export default function TravellerHomeScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const { trip } = useActiveTrip();
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [lastTranslation, setLastTranslation] = useState<LastTranslation | null>(null);

  const load = useCallback(async () => {
    const [act, last] = await Promise.all([getRecentActivity(lang), getLastTranslation(lang)]);
    setActivity(act);
    setLastTranslation(last);
  }, [lang]);

  // Refresh the activity strip whenever the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Traveller Mode</Text>
        <Text style={styles.subtitle}>
          {pack.flag} {pack.name} · learn while you travel. Works fully offline.
        </Text>

        <View style={styles.grid}>
          {ENTRIES.map((e) => (
            <Pressable
              key={e.href}
              accessibilityRole="button"
              accessibilityLabel={`${e.title}. ${e.sub}`}
              onPress={() => router.push(e.href as never)}
              style={({ pressed }) => [styles.entryCard, pressed && { opacity: 0.92 }]}
            >
              <Text style={styles.entryEmoji}>{e.emoji}</Text>
              <Text style={styles.entryTitle}>{e.title}</Text>
              <Text style={styles.entrySub}>{e.sub}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Emergency Mode"
          onPress={() => router.push('/traveller/emergency')}
          style={({ pressed }) => [styles.emergencyBtn, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.emergencyEmoji}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Emergency Mode</Text>
            <Text style={styles.emergencySub}>Doctor · Police · Taxi · Pharmacy · Help</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage trip decks"
          onPress={() => router.push('/traveller/trips')}
          style={({ pressed }) => [styles.tripBar, pressed && { opacity: 0.92 }]}
        >
          <Text style={styles.tripEmoji}>🧳</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tripTitle}>{trip ? trip.name : 'No active trip'}</Text>
            <Text style={styles.tripSub}>
              {trip ? 'Saved phrases join this deck' : 'Create a trip deck to collect phrases'}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <Card style={styles.activityCard}>
          <ActivityRow
            emoji="🔤"
            label="Last translated"
            value={lastTranslation ? lastTranslation.text : 'Nothing yet'}
            hint={lastTranslation ? lastTranslation.source : undefined}
          />
          <View style={styles.divider} />
          <ActivityRow
            emoji="⭐"
            label="Last saved"
            value={activity?.lastSaved ? activity.lastSaved.text : 'Nothing saved yet'}
            hint={activity?.lastSaved ? activity.lastSaved.source : undefined}
          />
          <View style={styles.divider} />
          <ActivityRow
            emoji="🔁"
            label="Due for review"
            value={
              activity && activity.dueCount > 0
                ? `${activity.dueCount} phrase${activity.dueCount > 1 ? 's' : ''}`
                : 'All caught up'
            }
            hint={activity ? `${activity.savedCount} saved in total` : undefined}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityRow({
  emoji,
  label,
  value,
  hint,
}: {
  emoji: string;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <View style={styles.activityRow}>
      <Text style={styles.activityEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityLabel}>{label}</Text>
        <Text style={styles.activityValue} numberOfLines={2}>
          {value}
        </Text>
        {hint ? (
          <Text style={styles.activityHint} numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(12), gap: spacing(3) },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), marginTop: spacing(1) },
  entryCard: {
    flexGrow: 1,
    flexBasis: '45%',
    minWidth: 150,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(1),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 132,
  },
  entryEmoji: { fontSize: 30 },
  entryTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text, marginTop: spacing(1) },
  entrySub: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 16 },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    minHeight: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.danger,
    paddingHorizontal: spacing(4),
  },
  emergencyEmoji: { fontSize: 30 },
  emergencyTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.white },
  emergencySub: { fontSize: fontSize.xs, color: colors.dangerSoft, marginTop: 2 },
  tripBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripEmoji: { fontSize: 26 },
  tripTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  tripSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: fontSize.xl, color: colors.textFaint },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing(2),
  },
  activityCard: { gap: spacing(3) },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  activityEmoji: { fontSize: 22 },
  activityLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  activityValue: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginTop: 2 },
  activityHint: { fontSize: fontSize.xs, color: colors.textFaint, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border },
});