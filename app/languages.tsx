import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { packs } from '@/content';
import { useAppStore } from '@/state/useAppStore';
import { Screen } from '@/components/ui';
import { colors, fontSize, radius, spacing } from '@/theme';

export default function LanguagesScreen() {
  const router = useRouter();
  const languageCode = useAppStore((s) => s.languageCode);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const choose = async (code: string) => {
    await setLanguage(code);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Screen style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose a language</Text>
          <Text style={styles.subtitle}>You can switch anytime. Progress is saved per language.</Text>
        </View>

        <View style={styles.list}>
          {packs.map((pack) => {
            const active = pack.code === languageCode;
            return (
              <Pressable
                key={pack.code}
                onPress={() => choose(pack.code)}
                style={({ pressed }) => [
                  styles.row,
                  active && styles.rowActive,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.flag}>{pack.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{pack.name}</Text>
                  <Text style={styles.english}>{pack.englishName}</Text>
                </View>
                {active && <Text style={styles.check}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      </Screen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { paddingHorizontal: spacing(5), paddingTop: spacing(6) },
  header: { marginBottom: spacing(6) },
  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.text },
  subtitle: { marginTop: spacing(1), fontSize: fontSize.sm, color: colors.textMuted },
  list: { gap: spacing(3) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  flag: { fontSize: 40 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  english: { fontSize: fontSize.sm, color: colors.textMuted },
  check: { fontSize: fontSize.xl, color: colors.primary, fontWeight: '800' },
});
