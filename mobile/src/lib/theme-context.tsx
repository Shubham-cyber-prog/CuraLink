import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  muted: string;
  teal: string;
  tealBg: string;
  tealBorder: string;
  accent: string;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  colors: ThemeColors;
}

const THEME_STORE_KEY = 'curalink_mobile_theme_mode';

const lightColors: ThemeColors = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  border: '#E2E8F0',
  text: '#1E293B',
  muted: '#64748B',
  teal: '#0D9488',
  tealBg: '#F0FDFA',
  tealBorder: '#CCFBF1',
  accent: '#0891B2',
};

const darkColors: ThemeColors = {
  bg: '#0B1120',
  surface: '#151B2E',
  surfaceElevated: '#1C2338',
  border: '#263049',
  text: '#F1F5F9',
  muted: '#94A3B8',
  teal: '#14B8A6',
  tealBg: 'rgba(20, 184, 166, 0.15)',
  tealBorder: 'rgba(20, 184, 166, 0.3)',
  accent: '#38BDF8',
};

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  isDark: false,
  setThemeMode: async () => {},
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme() ?? 'light');
  const { setColorScheme } = useNativeWindColorScheme();

  // Load saved preference from SecureStore
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await SecureStore.getItemAsync(THEME_STORE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeModeState(saved as ThemeMode);
        }
      } catch (err) {
        console.warn('Could not load mobile theme preference:', err);
      }
    }
    loadTheme();
  }, []);

  // Listen to device system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme ?? 'light');
    });
    return () => subscription.remove();
  }, []);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  // Synchronize NativeWind dark mode class
  useEffect(() => {
    setColorScheme(isDark ? 'dark' : 'light');
  }, [isDark, setColorScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await SecureStore.setItemAsync(THEME_STORE_KEY, mode);
    } catch (err) {
      console.warn('Could not persist mobile theme mode:', err);
    }
  };

  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      themeMode,
      isDark,
      setThemeMode,
      colors,
    }),
    [themeMode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
