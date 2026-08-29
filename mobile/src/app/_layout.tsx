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
import { AuthProvider } from '../lib/auth-context';
import { AnimatedSplash } from '../components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 0, fade: false });

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
    <AuthProvider>
      <StatusBar style="dark" />
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
