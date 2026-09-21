import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Vibration, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter, useNavigation, usePathname } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Samsung One UI edge gesture tuning constants
const EDGE_STRIP_WIDTH = 26; // narrow edge zone at bezels
const TRIGGER_THRESHOLD = 42; // distance required to prime the back action
const MAX_BUBBLE_WIDTH = 52;  // max horizontal stretch of the bubble
const BUBBLE_HEIGHT = 48;     // vertical height of the bubble

interface Props {
  children?: React.ReactNode;
}

export function SamsungEdgeBackGesture({ children }: Props) {
  const router = useRouter();
  const navigation = useNavigation();

  // Shared values for left edge gesture
  const leftTranslateX = useSharedValue(0);
  const leftTouchY = useSharedValue(SCREEN_HEIGHT / 2);
  const leftIsActive = useSharedValue(false);
  const leftOpacity = useSharedValue(0);

  // Shared values for right edge gesture
  const rightTranslateX = useSharedValue(0);
  const rightTouchY = useSharedValue(SCREEN_HEIGHT / 2);
  const rightIsActive = useSharedValue(false);
  const rightOpacity = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(15);
      } else {
        Vibration.vibrate(10);
      }
    } catch {
      // Ignore if device lacks vibrator
    }
  }, []);

  const handleNavigateBack = useCallback(() => {
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (router.canGoBack()) {
        router.back();
      }
    } catch {
      // Fallback
    }
  }, [navigation, router]);

  const pathname = usePathname();
  const canGoBackShared = useSharedValue(false);

  React.useEffect(() => {
    try {
      const can = Boolean(navigation.canGoBack() || router.canGoBack());
      canGoBackShared.value = can;
    } catch {
      canGoBackShared.value = false;
    }
  }, [pathname, navigation, router, canGoBackShared]);

  // --- LEFT EDGE PAN GESTURE ---
  const leftPanGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([8, 999]) // Must swipe horizontally inwards at least 8px
      .failOffsetY([-18, 18])  // Fail immediately if vertical scroll is detected
      .onBegin((e) => {
        'worklet';
        if (!canGoBackShared.value) return;

        leftTouchY.value = Math.max(90, Math.min(SCREEN_HEIGHT - 130, e.absoluteY));
        leftTranslateX.value = 0;
        leftIsActive.value = false;
        leftOpacity.value = withTiming(1, { duration: 120 });
      })
      .onUpdate((e) => {
        'worklet';
        if (!canGoBackShared.value) return;
        const d = Math.max(0, e.translationX);
        // Physics curve with spring resistance
        const stretch = Math.min(MAX_BUBBLE_WIDTH, Math.pow(d, 0.85) * 1.8);
        leftTranslateX.value = stretch;

        if (stretch >= TRIGGER_THRESHOLD && !leftIsActive.value) {
          leftIsActive.value = true;
          runOnJS(triggerHaptic)();
        } else if (stretch < TRIGGER_THRESHOLD && leftIsActive.value) {
          leftIsActive.value = false;
        }
      })
      .onEnd(() => {
        'worklet';
        if (leftIsActive.value) {
          runOnJS(handleNavigateBack)();
        }
        leftTranslateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        leftOpacity.value = withTiming(0, { duration: 160 });
        leftIsActive.value = false;
      })
      .onFinalize(() => {
        'worklet';
        leftTranslateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        leftOpacity.value = withTiming(0, { duration: 160 });
        leftIsActive.value = false;
      });
  }, [canGoBackShared, handleNavigateBack, triggerHaptic, leftIsActive, leftOpacity, leftTouchY, leftTranslateX]);

  // --- RIGHT EDGE PAN GESTURE ---
  const rightPanGesture = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetX([-999, -8]) // Must swipe horizontally inwards at least 8px
      .failOffsetY([-18, 18])   // Fail immediately if vertical scroll is detected
      .onBegin((e) => {
        'worklet';
        if (!canGoBackShared.value) return;

        rightTouchY.value = Math.max(90, Math.min(SCREEN_HEIGHT - 130, e.absoluteY));
        rightTranslateX.value = 0;
        rightIsActive.value = false;
        rightOpacity.value = withTiming(1, { duration: 120 });
      })
      .onUpdate((e) => {
        'worklet';
        if (!canGoBackShared.value) return;
        const d = Math.max(0, -e.translationX);
        const stretch = Math.min(MAX_BUBBLE_WIDTH, Math.pow(d, 0.85) * 1.8);
        rightTranslateX.value = stretch;

        if (stretch >= TRIGGER_THRESHOLD && !rightIsActive.value) {
          rightIsActive.value = true;
          runOnJS(triggerHaptic)();
        } else if (stretch < TRIGGER_THRESHOLD && rightIsActive.value) {
          rightIsActive.value = false;
        }
      })
      .onEnd(() => {
        'worklet';
        if (rightIsActive.value) {
          runOnJS(handleNavigateBack)();
        }
        rightTranslateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        rightOpacity.value = withTiming(0, { duration: 160 });
        rightIsActive.value = false;
      })
      .onFinalize(() => {
        'worklet';
        rightTranslateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        rightOpacity.value = withTiming(0, { duration: 160 });
        rightIsActive.value = false;
      });
  }, [canGoBackShared, handleNavigateBack, triggerHaptic, rightIsActive, rightOpacity, rightTouchY, rightTranslateX]);

  // Animated styles for Left Bubble
  const leftBubbleStyle = useAnimatedStyle(() => {
    const width = interpolate(leftTranslateX.value, [0, MAX_BUBBLE_WIDTH], [0, MAX_BUBBLE_WIDTH], Extrapolation.CLAMP);
    const scale = interpolate(leftTranslateX.value, [0, TRIGGER_THRESHOLD], [0.6, 1], Extrapolation.CLAMP);
    const bg = leftIsActive.value ? '#0D9488' : 'rgba(15, 23, 42, 0.90)';

    return {
      top: leftTouchY.value - BUBBLE_HEIGHT / 2,
      width,
      opacity: leftOpacity.value,
      backgroundColor: bg,
      transform: [{ scale }],
    };
  });

  const leftIconStyle = useAnimatedStyle(() => {
    const scale = leftIsActive.value ? withSpring(1.2) : withSpring(1);
    const translateX = interpolate(leftTranslateX.value, [0, TRIGGER_THRESHOLD], [-6, 2], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateX }],
    };
  });

  // Animated styles for Right Bubble
  const rightBubbleStyle = useAnimatedStyle(() => {
    const width = interpolate(rightTranslateX.value, [0, MAX_BUBBLE_WIDTH], [0, MAX_BUBBLE_WIDTH], Extrapolation.CLAMP);
    const scale = interpolate(rightTranslateX.value, [0, TRIGGER_THRESHOLD], [0.6, 1], Extrapolation.CLAMP);
    const bg = rightIsActive.value ? '#0D9488' : 'rgba(15, 23, 42, 0.90)';

    return {
      top: rightTouchY.value - BUBBLE_HEIGHT / 2,
      width,
      opacity: rightOpacity.value,
      backgroundColor: bg,
      transform: [{ scale }],
    };
  });

  const rightIconStyle = useAnimatedStyle(() => {
    const scale = rightIsActive.value ? withSpring(1.2) : withSpring(1);
    const translateX = interpolate(rightTranslateX.value, [0, TRIGGER_THRESHOLD], [6, -2], Extrapolation.CLAMP);

    return {
      transform: [{ scale }, { translateX }],
    };
  });

  return (
    <View style={styles.container}>
      {children}

      {/* Edge Touch Strips (only active at bezel edges) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <GestureDetector gesture={leftPanGesture}>
          <Animated.View style={styles.leftEdgeStrip} />
        </GestureDetector>

        <GestureDetector gesture={rightPanGesture}>
          <Animated.View style={styles.rightEdgeStrip} />
        </GestureDetector>

        {/* Samsung One UI Left Back Pill */}
        <Animated.View style={[styles.leftBubble, leftBubbleStyle]} pointerEvents="none">
          <Animated.View style={[styles.iconContainer, leftIconStyle]}>
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.8} />
          </Animated.View>
        </Animated.View>

        {/* Samsung One UI Right Back Pill */}
        <Animated.View style={[styles.rightBubble, rightBubbleStyle]} pointerEvents="none">
          <Animated.View style={[styles.iconContainer, rightIconStyle]}>
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2.8} />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  leftEdgeStrip: {
    position: 'absolute',
    left: 0,
    top: 50,
    bottom: 80,
    width: EDGE_STRIP_WIDTH,
    zIndex: 9999,
  },
  rightEdgeStrip: {
    position: 'absolute',
    right: 0,
    top: 50,
    bottom: 80,
    width: EDGE_STRIP_WIDTH,
    zIndex: 9999,
  },
  leftBubble: {
    position: 'absolute',
    left: 0,
    height: BUBBLE_HEIGHT,
    borderTopRightRadius: BUBBLE_HEIGHT / 2,
    borderBottomRightRadius: BUBBLE_HEIGHT / 2,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10000,
  },
  rightBubble: {
    position: 'absolute',
    right: 0,
    height: BUBBLE_HEIGHT,
    borderTopLeftRadius: BUBBLE_HEIGHT / 2,
    borderBottomLeftRadius: BUBBLE_HEIGHT / 2,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: -3, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    zIndex: 10000,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
