import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { cardShadow, colors, fontSize, radius, spacing } from '@/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  tone?: 'primary' | 'success' | 'danger' | 'neutral';
}) {
  const bg =
    tone === 'success'
      ? colors.success
      : tone === 'danger'
      ? colors.danger
      : tone === 'neutral'
      ? colors.card
      : colors.primary;
  const fg = tone === 'neutral' ? colors.text : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg },
        tone === 'neutral' && { borderWidth: 1, borderColor: colors.border },
        disabled && styles.btnDisabled,
        pressed && { opacity: 0.88, transform: [{ scale: 0.99 }] },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

export function Chip({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'warning';
}) {
  const map = {
    neutral: { bg: colors.border, fg: colors.text },
    primary: { bg: colors.primarySoft, fg: colors.primaryDark },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  } as const;
  const c = map[tone];
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }]}>
      <Text style={[styles.chipText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    ...cardShadow,
  },
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  chip: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(3),
  },
  chipText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});
