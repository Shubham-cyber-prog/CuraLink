import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from './api';
import type { AuthUser } from './api';
import { saveToken, getToken, removeToken } from './secure-store';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
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

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * AuthProvider — wraps the app and manages JWT auth state globally.
 *
 * Route guard logic:
 *  • Unauthenticated + in (tabs)  → redirect to /(auth)/login
 *  • Authenticated   + in (auth)  → redirect to /(tabs)
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

  // ── Bootstrap: restore session from SecureStore on mount ──────────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const storedToken = await getToken();
        if (storedToken) {
          const res = await getCurrentUser();
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
        // Token invalid or network error — clear it and treat as logged out.
        await removeToken();
      }
      setState(prev => ({ ...prev, isLoading: false }));
    }
    bootstrap();
  }, []);

  // ── Route guard: redirect based on auth state after loading ───────────────
  useEffect(() => {
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (state.isAuthenticated && inAuthGroup) {
      // Logged-in user lands on an auth screen → send to dashboard
      router.replace('/(tabs)');
    } else if (!state.isAuthenticated && inTabsGroup) {
      // Unauthenticated user tries to reach a protected tab → send to login
      router.replace('/(auth)/login');
    }
  }, [state.isAuthenticated, state.isLoading, segments, router]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email.trim().toLowerCase(), password);
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

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'PATIENT' | 'DOCTOR',
  ) => {
    const res = await apiRegister(name, email.trim().toLowerCase(), password, role);
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
    await apiLogout(); // calls POST /auth/logout + clears SecureStore
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.replace('/(auth)/login');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      if (res.success && res.data) {
        setState(prev => ({ ...prev, user: res.data!.user }));
      }
    } catch {
      // Silently fail — caller can decide to re-try
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
