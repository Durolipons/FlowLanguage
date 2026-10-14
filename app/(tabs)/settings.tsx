import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { packs, requirePack } from '@/content';
import { Card, PrimaryButton } from '@/components/ui';
import { resetProgress } from '@/db/progress';
import { useAppStore } from '@/state/useAppStore';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const languageCode = useAppStore((s) => s.languageCode);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const summary = useAppStore((s) => s.summary);
  const refresh = useAppStore((s) => s.refresh);
  const pack = requirePack(languageCode);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Learning language</Text>
          <Text style={styles.blockSub}>
            Currently {pack.flag} {pack.name} ({pack.englishName})
          </Text>
          <PrimaryButton label="Change language" onPress={() => router.push('/languages')} />
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Available languages</Text>
          <View style={styles.langList}>
            {packs.map((p) => {
              const active = p.code === languageCode;
              return (
                <Pressable
                  key={p.code}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to ${p.englishName}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => void setLanguage(p.code)}
                  style={({ pressed }) => [
                    styles.langRow,
                    active && styles.langRowActive,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.langFlag}>{p.flag}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.langName}>{p.name}</Text>
                    <Text style={styles.langEn}>{p.englishName}</Text>
                  </View>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Progress</Text>
          <Text style={styles.blockSub}>
            {summary.streak}-day streak · {summary.xp} XP · goal {summary.dailyDone}/
            {summary.dailyGoal} today
          </Text>
          <PrimaryButton
            label="Reset all progress"
            tone="danger"
            onPress={async () => {
              await resetProgress();
              await refresh();
              router.replace('/');
            }}
          />
        </Card>

        <Card style={styles.block}>
          <Text style={styles.blockTitle}>Offline</Text>
          <Text style={styles.blockSub}>
            Every screen works with zero network. Lessons, dialogues, the Traveller
            phrasebook, translate lookup, review scheduling and audio all run on this
            device. Speech uses on-device recognition and on-device text-to-speech.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(12), gap: spacing(4) },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  block: { gap: spacing(3) },
  blockTitle: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  blockSub: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 20 },
  langList: { gap: spacing(2) },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    borderRadius: radius.md,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 56,
  },
  langRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  langFlag: { fontSize: 24 },
  langName: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  langEn: { fontSize: fontSize.sm, color: colors.textMuted },
  check: { fontSize: fontSize.lg, fontWeight: '800', color: colors.primary },
});