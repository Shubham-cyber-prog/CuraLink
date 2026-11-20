import React from 'react';
import { Pressable, type PressableProps, type ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export const SPRING_SNAPPY = {
  damping: 18,
  stiffness: 260,
  mass: 0.7,
};

export const SPRING_GENTLE = {
  damping: 20,
  stiffness: 170,
  mass: 0.85,
};

interface MotionViewProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'fade';
  className?: string;
  enableLayoutAnimation?: boolean;
}

/**
 * Framer-Motion-style spring entrance wrapper powered natively by react-native-reanimated.
 */
export function MotionView({
  children,
  delay = 0,
  direction = 'down',
  className = '',
  enableLayoutAnimation = false,
  style,
  ...props
}: MotionViewProps) {
  const entering =
    direction === 'fade'
      ? FadeIn.delay(delay).duration(320)
      : direction === 'up'
      ? FadeInUp.delay(delay).springify().damping(18).stiffness(190)
      : FadeInDown.delay(delay).springify().damping(18).stiffness(190);

  return (
    <Animated.View
      entering={entering}
      layout={enableLayoutAnimation ? LinearTransition.springify().damping(20).stiffness(180) : undefined}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

interface MotionPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleTo?: number;
  className?: string;
}

/**
 * Spring-physics tactile pressable (Framer Motion whileTap equivalent on native iOS/Android).
 */
export function MotionPressable({
  children,
  scaleTo = 0.96,
  className = '',
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: MotionPressableProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPressIn={(e) => {
          scale.value = withSpring(scaleTo, SPRING_SNAPPY);
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, SPRING_SNAPPY);
          onPressOut?.(e);
        }}
        className={className}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
