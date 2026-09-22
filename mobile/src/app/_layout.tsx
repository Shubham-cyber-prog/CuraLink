import '../global.css';
import { useCallback, useEffect, useState } from 'react';
import { Stack, CardStyleInterpolators, TransitionSpecs } from 'expo-router/js-stack';
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

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UniversalEdgeBackGesture } from '../components/UniversalEdgeBackGesture';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <NetworkAlertBanner />
        <UniversalEdgeBackGesture>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              gestureResponseDistance: 30, // 20-30px edge activation zone
              gestureVelocityImpact: 0.3,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
              transitionSpec: {
                open: TransitionSpecs.TransitionIOSSpec,
                close: TransitionSpecs.TransitionIOSSpec,
              },
              detachPreviousScreen: false, // Ensures previous screen is actively rendered underneath during swipe
              cardShadowEnabled: true,
              cardOverlayEnabled: true,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen
              name="(auth)"
              options={{
                gestureEnabled: false,
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="(tabs)"
              options={{
                gestureEnabled: false,
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="(doctor-tabs)"
              options={{
                gestureEnabled: false,
                cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter,
              }}
            />
            <Stack.Screen
              name="symptom-checker"
              options={{
                gestureEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                gestureResponseDistance: 30,
              }}
            />
            <Stack.Screen
              name="doctor-booking"
              options={{
                gestureEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                gestureResponseDistance: 30,
              }}
            />
            <Stack.Screen
              name="chat"
              options={{
                gestureEnabled: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                gestureResponseDistance: 30,
              }}
            />
            <Stack.Screen
              name="consultation/[id]"
              options={{
                gestureEnabled: false,
                animation: 'none',
              }}
            />
          </Stack>
        </UniversalEdgeBackGesture>
        {!splashComplete ? <AnimatedSplash onAnimationComplete={onSplashComplete} /> : null}
      </AuthProvider>
    </GestureHandlerRootView>
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
