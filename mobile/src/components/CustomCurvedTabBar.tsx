import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Stethoscope, CalendarCheck, User, Bot } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function CustomCurvedTabBar({ state, descriptors, navigation }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12);
  const { isDark, colors } = useTheme();

  return (
    <View
      style={[
        styles.floatingPill,
        {
          bottom: bottomOffset,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: isDark ? '#000000' : '#0F172A',
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          if (options.href === null) return null;

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

          const color = isFocused ? colors.teal : colors.muted;

          // Center Elevated Floating AI Check Button
          if (route.name === 'symptom-checker') {
            return (
              <View key={route.key} style={styles.centerTabWrapper}>
                <Pressable
                  onPress={onPress}
                  style={({ pressed }) => [
                    styles.centerFloatingButton,
                    {
                      backgroundColor: colors.teal,
                      borderColor: colors.surface,
                    },
                    isFocused && { borderColor: colors.tealBorder },
                    pressed && { transform: [{ scale: 0.94 }] },
                  ]}
                >
                  <Bot size={24} color="#FFFFFF" />
                </Pressable>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? colors.teal : colors.muted, fontWeight: isFocused ? '700' : '500' },
                  ]}
                >
                  AI Check
                </Text>
              </View>
            );
          }

          let IconComponent = Home;
          let label = 'Home';

          if (route.name === 'index') {
            IconComponent = Home;
            label = 'Home';
          } else if (route.name === 'doctors') {
            IconComponent = Stethoscope;
            label = 'Doctors';
          } else if (route.name === 'appointments') {
            IconComponent = CalendarCheck;
            label = 'Visits';
          } else if (route.name === 'profile') {
            IconComponent = User;
            label = 'Profile';
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <View style={styles.iconContainer}>
                {isFocused && (
                  <View
                    style={[
                      styles.activeIndicatorBg,
                      { backgroundColor: colors.tealBg },
                    ]}
                  />
                )}
                <IconComponent size={20} color={color} />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  { color, fontWeight: isFocused ? '700' : '500' },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingPill: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
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
    paddingVertical: 4,
  },
  iconContainer: {
    height: 28,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  activeIndicatorBg: {
    position: 'absolute',
    inset: 0,
    borderRadius: 14,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  centerTabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  centerFloatingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    elevation: 12,
    shadowColor: '#0F9D8C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
