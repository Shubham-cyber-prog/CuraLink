import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { api } from './api';
import { saveToken, getToken, removeToken } from './secure-store';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'PATIENT' | 'DOCTOR') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

/**
 * AuthProvider — wraps the app and manages JWT auth state globally.
 * Handles auto-redirect based on auth status using Expo Router segments.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const router = useRouter();
  const segments = useSegments();

  // ── Bootstrap: check for existing token on mount ──
  useEffect(() => {
    async function bootstrap() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          const res = await api.get<{ user: User }>('/auth/me');
          if (res.success && res.data) {
            setState({
              user: res.data.user,
              token: storedToken,
              isLoading: false,
              isAuthenticated: true,
            });
            return;
          }
        }
      } catch {
        // Token invalid or expired — clear it
        await removeToken();
      }
      setState(prev => ({ ...prev, isLoading: false }));
    }
    bootstrap();
  }, []);

  // ── Route guard: redirect based on auth state ──
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (state.isAuthenticated && inAuthGroup) {
      // Logged in but on auth screen → go to dashboard
      router.replace('/(tabs)');
    } else if (!state.isAuthenticated && inTabsGroup) {
      // Not logged in but on protected screen → go to onboarding
      router.replace('/');
    }
  }, [state.isAuthenticated, state.isLoading, segments, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
    if (res.data?.token) {
      await saveToken(res.data.token);
      setState({
        user: res.data.user,
        token: res.data.token,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: 'PATIENT' | 'DOCTOR') => {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { name, email, password, role });
    if (res.data?.token) {
      await saveToken(res.data.token);
      setState({
        user: res.data.user,
        token: res.data.token,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await removeToken();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.replace('/');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.success && res.data) {
        setState(prev => ({ ...prev, user: res.data!.user }));
      }
    } catch {
      // Silently fail — user data will be stale
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
