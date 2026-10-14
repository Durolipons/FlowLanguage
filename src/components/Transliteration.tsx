import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import { colors, fontSize, spacing } from '@/theme';

/**
 * Small Latin transliteration line rendered under a target-script word or
 * phrase (e.g. Arabic), so learners who cannot yet read the script still see
 * how to pronounce it. Renders nothing when no romanization is provided, so
 * Latin-script languages (es/fr/pl) are unaffected.
 */
export function Transliteration({
  text,
  style,
}: {
  /** The romanized pronunciation string (e.g. 'shukran'). */
  text?: string;
  style?: StyleProp<TextStyle>;
}) {
  const value = text?.trim();
  if (!value) return null;
  return <Text style={[styles.transliteration, style]}>{value}</Text>;
}

const styles = StyleSheet.create({
  transliteration: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: spacing(1),
    textAlign: 'center',
    // Keep it LTR even when the word above is RTL.
    writingDirection: 'ltr',
  },
});