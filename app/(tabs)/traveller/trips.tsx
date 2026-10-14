import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { PrimaryButton } from '@/components/ui';
import { DeckCard, EmptyState, TravHeader } from '@/components/traveller';
import {
  createTrip,
  deleteTrip,
  getTrips,
  setActiveTrip,
  tripStats,
  type Trip,
  type TripStats,
} from '@/db/progress';
import { useTravellerLang } from '@/traveller/useTraveller';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function TripsScreen() {
  const router = useRouter();
  const { lang, pack } = useTravellerLang();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<Record<number, TripStats>>({});
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    const list = await getTrips();
    setTrips(list);
    const entries = await Promise.all(
      list.map(async (t) => [t.id, await tripStats(t.id)] as const)
    );
    setStats(Object.fromEntries(entries));
  }, []);

  // Refresh counts whenever the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = await createTrip(trimmed, lang);
    await setActiveTrip(id);
    setName('');
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteTrip(id);
    await load();
  };

  const handleUse = async (id: number) => {
    await setActiveTrip(id);
    await load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TravHeader
        title="Trip Decks"
        subtitle={`${pack.flag} ${pack.name} · saved phrases join the active deck`}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.createRow}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="New trip name (e.g. Madrid, June)"
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            accessibilityLabel="New trip name"
          />
          <PrimaryButton
            label="New trip"
            onPress={() => void handleCreate()}
            disabled={!name.trim()}
          />
        </View>

        {trips.length === 0 ? (
          <EmptyState
            emoji="🧳"
            title="No trip decks yet"
            text="Create a trip to collect the phrases you save. Review them before you go."
          />
        ) : (
          trips.map((t) => (
            <DeckCard
              key={t.id}
              name={t.name}
              active={t.active === 1}
              total={stats[t.id]?.total ?? 0}
              due={stats[t.id]?.due ?? 0}
              masteryPct={stats[t.id]?.masteryPct ?? 0}
              onUse={() => void handleUse(t.id)}
              onDelete={() => void handleDelete(t.id)}
            />
          ))
        )}

        {trips.some((t) => (stats[t.id]?.due ?? 0) > 0) ? (
          <PrimaryButton label="Start deck review" onPress={() => router.push('/traveller/review')} />
        ) : null}

        <Text style={styles.footnote}>
          Deleting a trip removes its saved phrases and review history. Curated phrasebook
          entries are never affected.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(4), paddingBottom: spacing(12), gap: spacing(3) },
  createRow: { gap: spacing(2) },
  input: {
    minHeight: 48,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    fontSize: fontSize.md,
    color: colors.text,
  },
  footnote: { fontSize: fontSize.xs, color: colors.textFaint, lineHeight: 17 },
});