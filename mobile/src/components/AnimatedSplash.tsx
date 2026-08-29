import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

const SPLASH_BG = '#F0FDFA';
const LOGO_SIZE = 88;

/** In-JS sequence only (native splash is hidden as soon as this view is on screen). */
export const SPLASH_ENTER_MS = 320;
export const SPLASH_HOLD_MS = 650;
export const SPLASH_EXIT_MS = 300;
export const SPLASH_ANIMATED_TOTAL_MS =
  SPLASH_ENTER_MS + SPLASH_HOLD_MS + SPLASH_EXIT_MS;

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const nativeHidden = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const hideNativeSplash = useCallback(() => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    const enter = reduceMotion ? 150 : SPLASH_ENTER_MS;
    const hold = reduceMotion ? 200 : SPLASH_HOLD_MS;
    const exit = reduceMotion ? 150 : SPLASH_EXIT_MS;
    const startScale = reduceMotion ? 1 : 0.8;

    opacity.value = 0;
    scale.value = startScale;

    const finish = (finished?: boolean) => {
      if (finished) runOnJS(onAnimationComplete)();
    };

    opacity.value = withSequence(
      withTiming(1, { duration: enter, easing: EASE }),
      withTiming(1, { duration: hold }),
      withTiming(0, { duration: exit, easing: EASE }, finish),
    );

    scale.value = withSequence(
      withTiming(1, { duration: enter, easing: EASE }),
      withTiming(1, { duration: hold }),
      withTiming(reduceMotion ? 1 : 0.98, { duration: exit, easing: EASE }),
    );
  }, [onAnimationComplete, opacity, reduceMotion, scale]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={styles.root}
      pointerEvents="auto"
      onLayout={hideNativeSplash}
      accessibilityRole="image"
      accessibilityLabel="CuraLink"
    >
      <Animated.View style={[styles.mark, markStyle]}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
        <Text style={styles.wordmark}>
          Cura<Text style={styles.wordmarkAccent}>Link</Text>
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BG,
  },
  mark: {
    alignItems: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  wordmark: {
    marginTop: 16,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    color: '#1E293B',
  },
  wordmarkAccent: {
    color: '#0d9488',
  },
});
