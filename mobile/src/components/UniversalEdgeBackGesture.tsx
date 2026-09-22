import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Vibration, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSharedValue, runOnJS } from 'react-native-reanimated';
import { useRouter, useNavigation, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Configurable edge activation zone width (26px from screen bezel)
const RIGHT_EDGE_WIDTH = 26;
const RIGHT_SWIPE_TRIGGER_DISTANCE = 42;

interface Props {
  children?: React.ReactNode;
}

/**
 * UniversalEdgeBackGesture
 * 
 * Provides right-edge inward back-gesture detection on Android devices,
 * harmonizing with JSStack's native left-edge interactive back-swipe preview.
 * 
 * Left-edge swipes pass directly to JSStack for 60fps real-time finger tracking,
 * parallax reveal of the previous screen, and spring physics.
 * 
 * Right-edge inward swipes trigger clean back navigation without displaying
 * intrusive edge panels or proprietary manufacturer-specific bubbles.
 */
export function UniversalEdgeBackGesture({ children }: Props) {
  const router = useRouter();
  const navigation = useNavigation();
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

  const triggerHaptic = useCallback(() => {
    try {
      if (Platform.OS === 'android') {
        Vibration.vibrate(12);
      }
    } catch {
      // Haptics not available
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

  // On Android, allow right-edge inward swipe to navigate back
  const rightEdgeGesture = useMemo(() => {
    // Only enable on Android; iOS uses native left-edge swipe exclusively
    if (Platform.OS === 'ios') {
      return Gesture.Native();
    }

    return Gesture.Pan()
      .activeOffsetX([-12, -999]) // Horizontal inward swipe
      .failOffsetY([-18, 18])     // Do not intercept vertical scrolling (ScrollView/FlatList)
      .onBegin((e) => {
        'worklet';
        // Only activate if touch began within RIGHT_EDGE_WIDTH of the right screen edge
        if (!canGoBackShared.value || e.absoluteX < SCREEN_WIDTH - RIGHT_EDGE_WIDTH) {
          return;
        }
      })
      .onEnd((e) => {
        'worklet';
        if (!canGoBackShared.value) return;

        // Verify touch started near right edge
        if (e.absoluteX - e.translationX < SCREEN_WIDTH - RIGHT_EDGE_WIDTH - 15) {
          return;
        }

        const distance = Math.abs(e.translationX);
        const velocity = Math.abs(e.velocityX);

        if (distance >= RIGHT_SWIPE_TRIGGER_DISTANCE || velocity > 500) {
          runOnJS(triggerHaptic)();
          runOnJS(handleNavigateBack)();
        }
      });
  }, [canGoBackShared, triggerHaptic, handleNavigateBack]);

  if (Platform.OS === 'ios') {
    return <View style={styles.container}>{children}</View>;
  }

  return (
    <View style={styles.container}>
      {children}
      {/* Right-edge touch strip positioned exclusively at the right bezel */}
      <View
        pointerEvents="box-none"
        style={styles.rightGestureLayer}
      >
        <GestureDetector gesture={rightEdgeGesture}>
          <View style={styles.rightEdgeHitZone} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rightGestureLayer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 9999,
  },
  rightEdgeHitZone: {
    width: RIGHT_EDGE_WIDTH,
    height: '100%',
    backgroundColor: 'transparent',
  },
});
