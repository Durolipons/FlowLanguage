import type { TravCategoryCode } from './types';

export const CATEGORY_IDS: TravCategoryCode[] = [
  'airport',
  'hotel',
  'restaurant',
  'shopping',
  'emergency',
  'transport',
  'custom',
];

export interface TravCategory {
  id: TravCategoryCode;
  /** Human label, e.g. 'Airport'. */
  label: string;
  /** @expo/vector-icons (MaterialIcons) glyph name. */
  icon: string;
  /** Emoji used by the UI (matches the app's emoji-based visual language). */
  emoji: string;
  /** Light decorative hex used by category chips. */
  tint: string;
}

export const CATEGORIES: TravCategory[] = [
  { id: 'airport', label: 'Airport', icon: 'flight', emoji: '✈️', tint: '#1A73E8' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel', emoji: '🏨', tint: '#E65100' },
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant', emoji: '🍽️', tint: '#2E7D32' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-cart', emoji: '🛍️', tint: '#6A1B9A' },
  { id: 'emergency', label: 'Emergency', icon: 'warning', emoji: '🚨', tint: '#B00020' },
  { id: 'transport', label: 'Transport', icon: 'directions-transit', emoji: '🚕', tint: '#00838F' },
  { id: 'custom', label: 'Custom', icon: 'add', emoji: '⭐', tint: '#616161' },
];

/** Lookup a category by its code (returns undefined for unknown codes). */
export function getCategory(code: TravCategoryCode): TravCategory | undefined {
  return CATEGORIES.find((c) => c.id === code);
}
