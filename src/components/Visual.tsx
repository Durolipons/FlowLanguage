import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import type { LexicalItem } from '@/content';

/** Renders an item's visual: a bundled/remote image if present, else a big emoji. */
export function Visual({ item, size = 120 }: { item: LexicalItem; size?: number }) {
  if (item.image) {
    return (
      <Image
        source={{ uri: item.image }}
        style={{ width: size, height: size, borderRadius: 20, backgroundColor: colors.border }}
        resizeMode="cover"
      />
    );
  }
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Text style={{ fontSize: size * 0.66 }}>{item.emoji ?? '❓'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
