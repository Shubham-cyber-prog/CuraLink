import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Users, CalendarCheck, Stethoscope } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';
import { BlurView } from 'expo-blur';

interface DoctorTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItemConfig {
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

const DOCTOR_TAB_CONFIGS: Record<string, TabItemConfig> = {
  index: {
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  patients: {
    label: 'Patients',
    icon: Users,
  },
  appointments: {
    label: 'Appointments',
    icon: CalendarCheck,
  },
  profile: {
    label: 'Practice',
    icon: Stethoscope,
  },
};

function AnimatedDoctorTabItem({
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
      toValue: 0.9,
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
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.16)' : 'rgba(13, 148, 136, 0.1)',
          },
        ]}
      >
        <IconComponent
          size={21}
          color={iconColor}
          strokeWidth={isFocused ? 2.4 : 1.8}
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

export function DoctorTabBar({ state, descriptors, navigation }: DoctorTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10);
  const { isDark, colors } = useTheme();

  const validRoutes = state.routes.filter((route: any) => {
    const { options } = descriptors[route.key] || {};
    if (options?.href === null) return false;
    return Boolean(DOCTOR_TAB_CONFIGS[route.name]);
  });

  const useBlur = Platform.OS === 'ios';

  const containerContent = (
    <View style={styles.tabsRow}>
      {validRoutes.map((route: any) => {
        const isFocused = state.routes[state.index]?.key === route.key;
        const tabConfig = DOCTOR_TAB_CONFIGS[route.name];
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

        return (
          <AnimatedDoctorTabItem
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
    left: 16,
    right: 16,
  },
  floatingContainer: {
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
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
    justifyContent: 'space-around',
    paddingHorizontal: 8,
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
    width: 14,
    height: 3,
    borderRadius: 1.5,
    marginTop: 2,
  },
});
