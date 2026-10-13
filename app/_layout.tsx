import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '@/state/useAppStore';
import { colors } from '@/theme';

export default function RootLayout() {
  const init = useAppStore((s) => s.init);
  const ready = useAppStore((s) => s.ready);

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </>
  );
}
