import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Stethoscope, CalendarCheck, User, Bot } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';
import { BlurView } from 'expo-blur';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItemConfig {
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  isCenter?: boolean;
}

const TAB_CONFIGS: Record<string, TabItemConfig> = {
  index: {
    label: 'Home',
    icon: Home,
  },
  doctors: {
    label: 'Doctors',
    icon: Stethoscope,
  },
  'symptom-checker': {
    label: 'AI Health',
    icon: Bot,
    isCenter: true,
  },
  appointments: {
    label: 'Visits',
    icon: CalendarCheck,
  },
  profile: {
    label: 'Profile',
    icon: User,
  },
};

function AnimatedTabItem({
  isFocused,
  tabConfig,
  onPress,
  routeKey,
  isDark,
  colors,
}: {
  isFocused: boolean;
  tabConfig: TabItemConfig;
  onPress: () => void;
  routeKey: string;
  isDark: boolean;
  colors: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const focusAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
  }, [isFocused, focusAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 160,
    }).start();
  };

  const IconComponent = tabConfig.icon;
  const iconColor = isFocused ? colors.teal : colors.muted;

  const iconTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Pressable
      key={routeKey}
      accessibilityRole="button"
      accessibilityLabel={tabConfig.label}
      accessibilityState={{ selected: isFocused }}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabItem}
    >
      <Animated.View
        style={[
          styles.iconCapsule,
          {
            transform: [{ scale: scaleAnim }, { translateY: iconTranslateY }],
          },
          isFocused && {
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.14)' : 'rgba(13, 148, 136, 0.08)',
          },
        ]}
      >
        <IconComponent
          size={21}
          color={iconColor}
          strokeWidth={isFocused ? 2.4 : 1.7}
        />
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.teal : colors.muted,
            fontWeight: isFocused ? '700' : '500',
            opacity: isFocused ? 1 : 0.75,
          },
        ]}
      >
        {tabConfig.label}
      </Text>
      {isFocused && (
        <Animated.View
          style={[
            styles.activePill,
            {
              backgroundColor: colors.teal,
              opacity: focusAnim,
              transform: [
                {
                  scaleX: focusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            },
          ]}
        />
      )}
    </Pressable>
  );
}

function CenterAIButton({
  isFocused,
  onPress,
  routeKey,
  isDark,
  colors,
}: {
  isFocused: boolean;
  onPress: () => void;
  routeKey: string;
  isDark: boolean;
  colors: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle breathing pulse for the center button glow ring
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 160,
    }).start();
  };

  return (
    <View key={routeKey} style={styles.centerTabWrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="AI Health Symptom Checker"
        accessibilityState={{ selected: isFocused }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.centerFloatingButton,
            {
              backgroundColor: colors.teal,
              borderColor: isDark ? '#0B1120' : '#FFFFFF',
              shadowColor: colors.teal,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Bot size={26} color="#FFFFFF" strokeWidth={2.2} />
        </Animated.View>
      </Pressable>
      <Text
        numberOfLines={1}
        style={[
          styles.centerTabLabel,
          {
            color: isFocused ? colors.teal : colors.muted,
            fontWeight: isFocused ? '700' : '600',
          },
        ]}
      >
        AI Health
      </Text>
    </View>
  );
}

export function CustomCurvedTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 8);
  const { isDark, colors } = useTheme();

  // Filter only the 5 valid tabs, excluding any hidden or extra screens (e.g. chat)
  const validRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key] || {};
    if (options?.href === null) return false;
    return Boolean(TAB_CONFIGS[route.name]);
  });

  const useBlur = Platform.OS === 'ios';

  const containerContent = (
    <View style={styles.tabsRow}>
      {validRoutes.map((route: any) => {
        const isFocused = state.routes[state.index]?.key === route.key;
        const tabConfig = TAB_CONFIGS[route.name];
        if (!tabConfig) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Center Highlighted AI Health Button
        if (tabConfig.isCenter) {
          return (
            <CenterAIButton
              key={route.key}
              isFocused={isFocused}
              onPress={onPress}
              routeKey={route.key}
              isDark={isDark}
              colors={colors}
            />
          );
        }

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            tabConfig={tabConfig}
            onPress={onPress}
            routeKey={route.key}
            isDark={isDark}
            colors={colors}
          />
        );
      })}
    </View>
  );

  return (
    <View
      style={[
        styles.outerContainer,
        { bottom: bottomOffset },
      ]}
    >
      <View
        style={[
          styles.floatingContainer,
          {
            backgroundColor: isDark ? '#151B2E' : '#FFFFFF',
            borderColor: isDark ? '#263049' : '#E2E8F0',
            shadowColor: isDark ? '#000000' : '#0F172A',
          },
        ]}
      >
        {containerContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  floatingContainer: {
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  iconCapsule: {
    height: 32,
    minWidth: 44,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.1,
    fontFamily: Platform.OS === 'ios' ? 'Inter_600SemiBold' : undefined,
  },
  activePill: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
  centerTabWrapper: {
    flex: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
  },
  centerGlowRing: {
    position: 'absolute',
    top: -4,
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  centerFloatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    elevation: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
  },
  centerTabLabel: {
    fontSize: 10,
    marginTop: 5,
    letterSpacing: -0.1,
    fontFamily: Platform.OS === 'ios' ? 'Inter_600SemiBold' : undefined,
  },
});
