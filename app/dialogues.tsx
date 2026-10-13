import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getDialogues, requirePack } from '@/content';
import { useAppStore } from '@/state/useAppStore';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function DialoguesScreen() {
  const router = useRouter();
  const languageCode = useAppStore((s) => s.languageCode);
  const pack = requirePack(languageCode);
  const list = getDialogues(languageCode);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Text style={styles.backIcon}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Dialogues</Text>
        <Text style={styles.subtitle}>
          {pack.flag} {pack.name} · listen and read along
        </Text>

        {list.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No dialogues yet for {pack.name}.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {list.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => router.push(`/dialogue/${d.id}`)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
              >
                <Text style={styles.emoji}>{d.emoji ?? '💬'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{d.title}</Text>
                  <Text style={styles.cardMeta}>
                    {d.turns.length} lines · {d.speakers.join(' & ')}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), gap: spacing(3) },
  back: { alignSelf: 'flex-start' },
  backIcon: { fontSize: fontSize.md, color: colors.primary, fontWeight: '700' },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted },
  list: { gap: spacing(3), marginTop: spacing(2) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
  },
  emoji: { fontSize: 30 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  cardMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  chevron: { fontSize: fontSize.xl, color: colors.textFaint },
  empty: { alignItems: 'center', paddingVertical: spacing(12), gap: spacing(2) },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
});
