import { useCallback, useEffect, useRef } from 'react';
import { AccessibilityInfo, Image, StyleSheet, Text } from 'react-native';
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
/** Match expo-splash-screen `imageWidth` so native → JS handoff does not resize the mark. */
const LOGO_SIZE = 128;

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
  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.8);
  const backdropOpacity = useSharedValue(1);
  const nativeHidden = useRef(false);

  const hideNativeSplash = useCallback(() => {
    if (nativeHidden.current) return;
    nativeHidden.current = true;
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finish = (finished?: boolean) => {
      if (finished) runOnJS(onAnimationComplete)();
    };

    void AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;

      const enter = reduceMotion ? 150 : SPLASH_ENTER_MS;
      const hold = reduceMotion ? 200 : SPLASH_HOLD_MS;
      const exit = reduceMotion ? 150 : SPLASH_EXIT_MS;

      markOpacity.value = 0;
      markScale.value = reduceMotion ? 1 : 0.8;
      backdropOpacity.value = 1;

      markOpacity.value = withSequence(
        withTiming(1, { duration: enter, easing: EASE }),
        withTiming(1, { duration: hold }),
        withTiming(0, { duration: exit, easing: EASE }),
      );

      markScale.value = withSequence(
        withTiming(1, { duration: enter, easing: EASE }),
        withTiming(1, { duration: hold }),
        withTiming(reduceMotion ? 1 : 0.98, { duration: exit, easing: EASE }),
      );

      backdropOpacity.value = withSequence(
        withTiming(1, { duration: enter + hold }),
        withTiming(0, { duration: exit, easing: EASE }, finish),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [backdropOpacity, markOpacity, markScale, onAnimationComplete]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  return (
    <Animated.View
      style={[styles.root, backdropStyle]}
      pointerEvents="auto"
      onLayout={hideNativeSplash}
      accessibilityRole="image"
      accessibilityLabel="CuraLink"
    >
      <Animated.View style={[styles.logoWrap, markStyle]}>
        <Image
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          source={require('../../assets/images/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
          alt=""
          accessibilityIgnoresInvertColors
        />
      </Animated.View>
      <Animated.View style={[styles.wordmarkWrap, markStyle]} pointerEvents="none">
        <Text style={styles.wordmark}>
          Cura<Text style={styles.wordmarkAccent}>Link</Text>
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    elevation: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BG,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  wordmarkWrap: {
    position: 'absolute',
    top: '50%',
    marginTop: LOGO_SIZE / 2 + 16,
    alignItems: 'center',
  },
  wordmark: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    letterSpacing: -0.6,
    color: '#1E293B',
  },
  wordmarkAccent: {
    color: '#0d9488',
  },
});
