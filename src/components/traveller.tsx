/**
 * Shared Traveller Mode UI components.
 *
 * Emoji-based to match the rest of the app's visual language, with >=48dp tap
 * targets and accessible labels on every icon-only control.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { speak } from '@/audio/tts';
import { cardShadow, colors, fontSize, radius, spacing } from '@/theme';
import type { MatchKind, TravPhrase } from '@/traveller/types';
import { getCategory } from '@/traveller/categories';
import { containsArabic, rtlTextStyle } from '@/utils/rtl';

/** Icon-only round button that speaks `text` via on-device TTS. */
export function AudioButton({
  text,
  language,
  label,
  size = 'md',
  tone = 'light',
}: {
  text: string;
  language: string;
  /** Accessible label; defaults to a sensible one. */
  label?: string;
  size?: 'md' | 'lg';
  tone?: 'light' | 'solid';
}) {
  const dim = size === 'lg' ? 64 : 48;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? `Play audio: ${text}`}
      hitSlop={6}
      onPress={() => speak(text, language)}
      style={({ pressed }) => [
        styles.audioBtn,
        { width: dim, height: dim, borderRadius: dim / 2 },
        tone === 'solid' && styles.audioBtnSolid,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={{ fontSize: size === 'lg' ? 28 : 20 }}>🔊</Text>
    </Pressable>
  );
}

/** Star toggle for saving/un-saving a phrase to the trip deck. */
export function SaveButton({
  saved,
  onToggle,
  label,
}: {
  saved: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? (saved ? 'Remove from saved phrases' : 'Save phrase')}
      hitSlop={6}
      onPress={onToggle}
      style={({ pressed }) => [styles.audioBtn, pressed && { opacity: 0.85 }]}
    >
      <Text style={{ fontSize: 20 }}>{saved ? '⭐' : '☆'}</Text>
    </Pressable>
  );
}

/** Copy-to-clipboard control (offline helper). */
export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Copy translation"
      hitSlop={6}
      onPress={async () => {
        await Clipboard.setStringAsync(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      style={({ pressed }) => [styles.audioBtn, pressed && { opacity: 0.85 }]}
    >
      <Text style={{ fontSize: 20 }}>{done ? '✅' : '📋'}</Text>
    </Pressable>
  );
}

const MATCH_TONE: Record<MatchKind, { bg: string; fg: string; label: string }> = {
  exact: { bg: colors.successSoft, fg: colors.success, label: 'Exact match' },
  close: { bg: colors.accentSoft, fg: '#0369a1', label: 'Close match' },
  word: { bg: colors.warningSoft, fg: '#b45309', label: 'Related phrase' },
  none: { bg: colors.border, fg: colors.textMuted, label: 'Not in your phrasebook' },
};

/** Honest labelling of how well the query matched the curated phrasebook. */
export function MatchBadge({ kind, score }: { kind: MatchKind; score?: number }) {
  const tone = MATCH_TONE[kind];
  const pct = kind === 'none' ? null : Math.round((score ?? 1) * 100);
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>
        {tone.label}
        {pct !== null && kind !== 'exact' ? ` · ${pct}%` : ''}
      </Text>
    </View>
  );
}

/** Selectable category filter chip. */
export function CategoryChip({
  code,
  label,
  emoji,
  selected,
  onPress,
  count,
}: {
  code: TravPhrase['category'];
  /** Override the category label (e.g. an "All" chip). */
  label?: string;
  /** Override the category emoji. */
  emoji?: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}) {
  const cat = getCategory(code);
  const text = label ?? cat?.label ?? code;
  const glyph = emoji ?? cat?.emoji ?? '📌';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${text} category`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={styles.chipEmoji}>{glyph}</Text>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {text}
        {count !== undefined ? ` ${count}` : ''}
      </Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

/** Back button + title header used by every Traveller sub-screen. */
export function TravHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
}: {
  emoji: string;
  title: string;
  text?: string;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {text ? <Text style={styles.emptyText}>{text}</Text> : null}
    </View>
  );
}

/**
 * Translate/Speak result card: English source → target translation → optional
 * curated pronunciation hint, plus Play / Save / Learn / Copy actions.
 */
export function TranslationCard({
  phrase,
  query,
  kind,
  score,
  ttsLanguage,
  saved,
  onSave,
  onLearn,
  big,
}: {
  phrase: TravPhrase;
  /** The English text the learner typed or spoke. */
  query?: string;
  kind: MatchKind;
  score: number;
  ttsLanguage: string;
  saved: boolean;
  onSave: () => void;
  onLearn?: () => void;
  /** Larger type for the Speak screen's conversation history. */
  big?: boolean;
}) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHead}>
        <MatchBadge kind={kind} score={score} />
        <View style={{ flex: 1 }} />
        <SaveButton saved={saved} onToggle={onSave} />
      </View>

      <Text style={styles.sourceText}>{query ?? phrase.source}</Text>
      <Text style={styles.arrow}>↓</Text>
      <Text style={[styles.targetText, big && styles.targetTextBig, rtlTextStyle(containsArabic(phrase.text))]}>{phrase.text}</Text>

      {phrase.hint ? (
        <View style={styles.hintBox}>
          <Text style={styles.hintLabel}>Pronunciation</Text>
          <Text style={styles.hintText}>{phrase.hint}</Text>
        </View>
      ) : null}

      <View style={styles.actionRow}>
        <AudioButton text={phrase.text} language={ttsLanguage} label="Play translation aloud" />
        <CopyButton text={phrase.text} />
        {onLearn ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Learn this phrase word by word"
            onPress={onLearn}
            style={({ pressed }) => [styles.pillBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.pillBtnText}>Learn This</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Phrasebook list row: target phrase, English gloss, play + save controls. */
export function PhraseRow({
  phrase,
  ttsLanguage,
  saved,
  onSave,
  onPress,
}: {
  phrase: TravPhrase;
  ttsLanguage: string;
  saved: boolean;
  onSave: () => void;
  onPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${phrase.text}. ${phrase.source}`}
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.rowBody, pressed && onPress ? { opacity: 0.8 } : null]}
      >
        <Text style={[styles.rowText, rtlTextStyle(containsArabic(phrase.text))]}>{phrase.text}</Text>
        <Text style={styles.rowSub}>{phrase.source}</Text>
        {phrase.hint ? <Text style={styles.rowHint}>{phrase.hint}</Text> : null}
      </Pressable>
      <AudioButton text={phrase.text} language={ttsLanguage} />
      <SaveButton saved={saved} onToggle={onSave} />
    </View>
  );
}

/** Trip deck card: name, counters, mastery bar, Use / delete controls. */
export function DeckCard({
  name,
  active,
  total,
  due,
  masteryPct,
  onUse,
  onDelete,
}: {
  name: string;
  active: boolean;
  total: number;
  due: number;
  masteryPct: number;
  onUse: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.deck, active && styles.deckActive]}>
      <View style={styles.deckHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deckName}>{name}</Text>
          <Text style={styles.deckMeta}>
            {total} saved · {due} due{active ? ' · Active' : ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete trip ${name}`}
          hitSlop={6}
          onPress={onDelete}
          style={({ pressed }) => [styles.audioBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={{ fontSize: 18 }}>🗑️</Text>
        </Pressable>
      </View>

      <View style={styles.masteryTrack}>
        <View style={[styles.masteryFill, { width: `${Math.round(masteryPct * 100)}%` }]} />
      </View>
      <Text style={styles.masteryLabel}>{Math.round(masteryPct * 100)}% mastered</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={active ? `Trip ${name} is active` : `Use trip ${name}`}
        onPress={onUse}
        style={({ pressed }) => [
          styles.deckUse,
          active && styles.deckUseActive,
          pressed && { opacity: 0.85 },
        ]}
      >
        <Text style={[styles.deckUseText, active && styles.deckUseTextActive]}>
          {active ? 'Active trip' : 'Use this trip'}
        </Text>
      </Pressable>
    </View>
  );
}

/** Large full-width Emergency button; expands to show the phrase when opened. */
export function EmergencyButton({
  emoji,
  label,
  expanded,
  onPress,
  children,
}: {
  emoji: string;
  label: string;
  expanded: boolean;
  onPress: () => void;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.emergencyWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded }}
        onPress={onPress}
        style={({ pressed }) => [styles.emergencyBtn, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.emergencyEmoji}>{emoji}</Text>
        <Text style={styles.emergencyLabel}>{label}</Text>
        <Text style={styles.emergencyChevron}>{expanded ? '▾' : '▸'}</Text>
      </Pressable>
      {expanded ? <View style={styles.emergencyBody}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  audioBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  audioBtnSolid: { backgroundColor: colors.primary },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(3),
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
    borderRadius: radius.pill,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3),
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  chipLabelSelected: { color: colors.white },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: { fontSize: 26, color: colors.primary, fontWeight: '700', marginTop: -3 },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '800', color: colors.text },
  headerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  empty: { alignItems: 'center', paddingVertical: spacing(10), gap: spacing(2) },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  emptyText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: 'center' },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(2),
    ...cardShadow,
  },
  resultHead: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  sourceText: { fontSize: fontSize.md, color: colors.textMuted },
  arrow: { fontSize: fontSize.md, color: colors.textFaint, textAlign: 'center' },
  targetText: { fontSize: fontSize.xl, fontWeight: '800', color: colors.text },
  targetTextBig: { fontSize: fontSize.xxl },
  hintBox: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing(3),
    gap: 2,
  },
  hintLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: '#0369a1',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hintText: { fontSize: fontSize.sm, color: colors.text },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(1),
  },
  pillBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(4),
  },
  pillBtnText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(3),
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBody: { flex: 1, gap: 2 },
  rowText: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: fontSize.sm, color: colors.textMuted },
  rowHint: { fontSize: fontSize.xs, color: colors.textFaint, fontStyle: 'italic' },
  deck: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
  deckActive: { borderColor: colors.primary, borderWidth: 2 },
  deckHead: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  deckName: { fontSize: fontSize.md, fontWeight: '800', color: colors.text },
  deckMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  masteryTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  masteryFill: { height: '100%', backgroundColor: colors.success, borderRadius: radius.pill },
  masteryLabel: { fontSize: fontSize.xs, color: colors.textMuted },
  deckUse: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckUseActive: { backgroundColor: colors.successSoft, borderColor: colors.success },
  deckUseText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  deckUseTextActive: { color: colors.success },
  emergencyWrap: { gap: spacing(2) },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    minHeight: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingHorizontal: spacing(4),
  },
  emergencyEmoji: { fontSize: 32 },
  emergencyLabel: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.danger,
  },
  emergencyChevron: { fontSize: fontSize.lg, color: colors.danger },
  emergencyBody: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing(4),
    gap: spacing(2),
    borderWidth: 1,
    borderColor: colors.border,
  },
});
