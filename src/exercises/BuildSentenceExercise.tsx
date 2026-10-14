import React, { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseProps } from './common';
import { shuffle } from '@/content/engine';
import { PrimaryButton } from '@/components/ui';
import { playItemAudio } from '@/audio/player';
import { tokensMatch, tokenize } from '@/utils/text';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';
import { Transliteration } from '@/components/Transliteration';
import { colors, fontSize, radius, spacing } from '@/theme';

interface Tile {
  uid: string;
  text: string;
}

export function BuildSentenceExercise({ exercise, ttsLanguage, script, onResolved }: ExerciseProps) {
  const { item } = exercise;
  const rtl = containsArabic(item.text);
  const correctTokens = useMemo(
    () =>
      item.segmented && item.segmented.length > 0
        ? item.segmented
        : tokenize(item.text, script),
    [item.text, item.segmented, script]
  );

  const [bank, setBank] = useState<Tile[]>(() =>
    shuffle(correctTokens.map((t, i) => ({ uid: `t${i}`, text: t })))
  );
  const [answer, setAnswer] = useState<Tile[]>([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const attempts = useRef(0);

  const addTile = (tile: Tile) => {
    if (done) return;
    setBank((b) => b.filter((t) => t.uid !== tile.uid));
    setAnswer((a) => [...a, tile]);
  };

  const removeTile = (tile: Tile) => {
    if (done) return;
    setAnswer((a) => a.filter((t) => t.uid !== tile.uid));
    setBank((b) => [...b, tile]);
  };

  const check = () => {
    if (done) return;
    attempts.current += 1;
    if (tokensMatch(answer.map((t) => t.text), correctTokens, script)) {
      setDone(true);
      const quality = attempts.current === 1 ? 5 : 3;
      setTimeout(() => onResolved(quality), 600);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 600);
    }
  };

  const resetAll = () => {
    setAnswer([]);
    setBank(shuffle(correctTokens.map((t, i) => ({ uid: `t${i}`, text: t }))));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.translation}>{item.translation}</Text>
          <Transliteration text={item.romanization} style={styles.translationHint} />
        </View>
        <Pressable onPress={() => playItemAudio(item, ttsLanguage)} hitSlop={8}>
          <Text style={styles.speaker}>🔊</Text>
        </Pressable>
      </View>

      <View style={[styles.answerBox, wrong && styles.answerBoxWrong, rtl && { flexDirection: 'row-reverse' }]}>
        {answer.length === 0 ? (
          <Text style={styles.placeholder}>Tap the words to build the phrase</Text>
        ) : (
          answer.map((tile) => (
            <Pressable key={tile.uid} onPress={() => removeTile(tile)}>
              <View style={styles.answerTile}>
                <Text style={[styles.tileText, rtlTextStyle(rtl)]}>{tile.text}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <View style={styles.bank}>
        {bank.map((tile) => (
          <Pressable key={tile.uid} onPress={() => addTile(tile)} disabled={done}>
            <View style={styles.bankTile}>
              <Text style={[styles.tileText, rtlTextStyle(rtl)]}>{tile.text}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Clear" tone="neutral" onPress={resetAll} style={{ flex: 1 }} disabled={done} />
        <PrimaryButton
          label="Check"
          onPress={check}
          tone={done ? 'success' : 'primary'}
          style={{ flex: 1 }}
          disabled={done || answer.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
    gap: spacing(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  translation: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    fontWeight: '600',
    flex: 1,
  },
  translationHint: {
    textAlign: 'left',
    marginTop: 2,
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.textFaint,
  },
  speaker: {
    fontSize: 28,
  },
  answerBox: {
    minHeight: 120,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.card,
    padding: spacing(3),
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing(2),
  },
  answerBoxWrong: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  placeholder: {
    color: colors.textFaint,
    fontSize: fontSize.sm,
  },
  answerTile: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(2),
    minHeight: 80,
  },
  bankTile: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
  },
  tileText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
  },
});
