export const colors = {
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primarySoft: '#eef2ff',
  accent: '#0ea5e9',
  accentSoft: '#e0f2fe',
  success: '#16a34a',
  successSoft: '#dcfce7',
  danger: '#dc2626',
  dangerSoft: '#fee2e2',
  warning: '#f59e0b',
  warningSoft: '#fef3c7',
  bg: '#f4f5fb',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  border: '#e6e9f2',
  white: '#ffffff',
  overlay: 'rgba(15, 23, 42, 0.45)',
  shadow: '#0f172a',
} as const;

export const spacing = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  display: 46,
} as const;

export const cardShadow = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
} as const;
