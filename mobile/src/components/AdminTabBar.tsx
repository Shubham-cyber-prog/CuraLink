import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart3, ShieldCheck, Users, ShieldAlert, Sliders } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';
import { BlurView } from 'expo-blur';

interface AdminTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

interface TabItemConfig {
  label: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
}

const ADMIN_TAB_CONFIGS: Record<string, TabItemConfig> = {
  index: {
    label: 'Overview',
    icon: BarChart3,
  },
  doctors: {
    label: 'Verify Docs',
    icon: ShieldCheck,
  },
  users: {
    label: 'Users',
    icon: Users,
  },
  profile: {
    label: 'Admin',
    icon: Sliders,
  },
};

function AnimatedAdminTabItem({
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
      tension: 100,
    }).start();
  }, [isFocused]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 140,
    }).start();
  };

  const IconComponent = tabConfig.icon;
  const activeColor = isDark ? '#F59E0B' : '#D97706'; // Admin Amber/Gold accents
  const inactiveColor = isDark ? '#94A3B8' : '#64748B';

  const iconTranslateY = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Animated.View style={{ flex: 1, transform: [{ scale: scaleAnim }] }}>
      <Pressable
        key={routeKey}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabItem}
        android_ripple={{
          color: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.08)',
          borderless: true,
          radius: 28,
        }}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            isFocused && {
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(254, 243, 199, 0.9)',
              borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(217, 119, 6, 0.25)',
              borderWidth: 1,
            },
            { transform: [{ translateY: iconTranslateY }] },
          ]}
        >
          <IconComponent
            size={19}
            color={isFocused ? activeColor : inactiveColor}
            strokeWidth={isFocused ? 2.3 : 1.8}
          />
        </Animated.View>

        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            { color: isFocused ? activeColor : inactiveColor },
            isFocused && styles.tabLabelFocused,
          ]}
        >
          {tabConfig.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function AdminTabBar({ state, descriptors, navigation }: AdminTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();

  return (
    <View style={[styles.outerContainer, { bottom: Math.max(insets.bottom, 10) }]}>
      <View
        style={[
          styles.barWrapper,
          {
            backgroundColor: isDark ? 'rgba(11, 31, 51, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderColor: isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(226, 232, 240, 0.9)',
          },
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.tabsRow}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            if (options.href === null) return null;

            const isFocused = state.index === index;
            const tabConfig = ADMIN_TAB_CONFIGS[route.name] || {
              label: options.title || route.name,
              icon: BarChart3,
            };

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
              <AnimatedAdminTabItem
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 99,
  },
  barWrapper: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 7,
    paddingHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  iconWrapper: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  tabLabelFocused: {
    fontFamily: 'Inter_700Bold',
  },
});
