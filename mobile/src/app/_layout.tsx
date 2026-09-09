import '../global.css';
import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { LogBox } from 'react-native';
import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider, useTheme } from '../lib/theme-context';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { NetworkAlertBanner } from '../components/NetworkAlertBanner';

// Suppress harmless Expo HMR dev server connection warnings in LogBox
LogBox.ignoreLogs([
  'Cannot connect to Expo CLI',
  'Inter failed to load',
  'Splashscreen.setOptions',
]);

try {
  void SplashScreen.preventAutoHideAsync();
} catch {
  // Ignore in reload or non-supported platforms
}

function MainLayoutContent({
  splashComplete,
  onSplashComplete,
}: {
  splashComplete: boolean;
  onSplashComplete: () => void;
}) {
  const { isDark } = useTheme();

  return (
    <AuthProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NetworkAlertBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="symptom-checker" options={{ presentation: 'card' }} />
        <Stack.Screen name="doctor-booking" options={{ presentation: 'card' }} />
      </Stack>
      {!splashComplete ? <AnimatedSplash onAnimationComplete={onSplashComplete} /> : null}
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [splashComplete, setSplashComplete] = useState(false);

  const fontsReady = fontsLoaded || Boolean(fontError);

  const onSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  useEffect(() => {
    if (fontError) {
      console.warn('Inter failed to load; continuing with system fonts.');
    }
  }, [fontError]);

  if (!fontsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <MainLayoutContent
        splashComplete={splashComplete}
        onSplashComplete={onSplashComplete}
      />
    </ThemeProvider>
  );
}
