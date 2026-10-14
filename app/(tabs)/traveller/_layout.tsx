import { Stack } from 'expo-router';
import { colors } from '@/theme';

/**
 * Traveller Mode nested stack. URLs: `/traveller` (home), `/traveller/translate`,
 * `/traveller/speak`, `/traveller/learn`, `/traveller/phrasebook`,
 * `/traveller/trips`, `/traveller/review`, `/traveller/emergency`.
 */
export default function TravellerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}