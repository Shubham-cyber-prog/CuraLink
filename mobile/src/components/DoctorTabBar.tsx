import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, Users, CalendarCheck, Calendar, Stethoscope, IndianRupee } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';

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
  appointments: {
    label: 'Visits',
    icon: CalendarCheck,
  },
  earnings: {
    label: 'Earnings',
    icon: IndianRupee,
  },
  schedule: {
    label: 'Schedule',
    icon: Calendar,
  },
  patients: {
    label: 'Patients',
    icon: Users,
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
            backgroundColor: isDark ? 'rgba(131, 197, 190, 0.16)' : 'rgba(0, 109, 119, 0.1)',
          },
        ]}
      >
        <IconComponent
          size={19}
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
            backgroundColor: isDark ? '#0B1F33' : '#FFFFFF',
            borderColor: isDark ? '#1B3650' : '#E2E9EC',
            shadowColor: isDark ? '#000000' : '#0B1F33',
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
    height: 64,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 16,
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
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 1.5,
  },
  iconCapsule: {
    height: 28,
    minWidth: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: -0.1,
    fontFamily: Platform.OS === 'ios' ? 'Inter_600SemiBold' : undefined,
  },
  activePill: {
    width: 12,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 1,
  },
});
