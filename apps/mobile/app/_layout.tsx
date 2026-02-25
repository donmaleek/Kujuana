import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '@/lib/api/query-client';
import { hydrateSession } from '@/lib/auth/bootstrap';
import { useAuthStore } from '@/store/auth-store';

export default function RootLayout() {
  const setSignedOut = useAuthStore((state) => state.setSignedOut);

  useEffect(() => {
    hydrateSession().catch(() => {
      setSignedOut();
    });
  }, [setSignedOut]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
