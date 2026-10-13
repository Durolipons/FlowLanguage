import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';
import type { LexicalItem } from '@/content';
import { getImageAsset } from '@/content/assets/imageAssets';
import { remoteImages } from '@/content/assets/remoteAssets';

/** Renders an item's visual: a bundled image, then a remote URL, then an emoji. */
export function Visual({ item, size = 120 }: { item: LexicalItem; size?: number }) {
  const bundled = getImageAsset(item.id);
  const remote = remoteImages[item.id];
  const source =
    bundled ?? (remote ? { uri: remote } : undefined) ?? (item.image ? { uri: item.image } : undefined);
  if (source) {
    return (
      <Image
        source={source}
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

