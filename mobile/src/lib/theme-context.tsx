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
  navy: string;
  teal: string;
  aqua: string;
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
  bg: '#F4F7F8',
  surface: '#FFFFFF',
  surfaceElevated: '#EDF3F4',
  border: '#E2E9EC',
  text: '#0B1F33',
  muted: '#5D7083',
  navy: '#0B1F33',
  teal: '#006D77',
  aqua: '#83C5BE',
  tealBg: '#EAF4F5',
  tealBorder: '#C7E3E5',
  accent: '#006D77',
};

const darkColors: ThemeColors = {
  bg: '#06101B',
  surface: '#0B1F33',
  surfaceElevated: '#112942',
  border: '#1B3650',
  text: '#F3F7F9',
  muted: '#94AABF',
  navy: '#0B1F33',
  teal: '#83C5BE',
  aqua: '#83C5BE',
  tealBg: 'rgba(131, 197, 190, 0.14)',
  tealBorder: 'rgba(131, 197, 190, 0.28)',
  accent: '#83C5BE',
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
