import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, Modal, Linking, Pressable } from 'react-native';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { ShieldAlert, ExternalLink, LogOut } from 'lucide-react-native';
import { api, subscribeSessionExpired } from './api';
import { saveTokens, getToken, getRefreshToken, removeToken } from './secure-store';

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
  login: (email: string, password: string, turnstileToken?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'PATIENT' | 'DOCTOR', turnstileToken?: string) => Promise<void>;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  loginWithToken: (authToken: string, refreshToken?: string) => Promise<void>;
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
  const rootNavigationState = useRootNavigationState();

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
        // Token invalid or expired — clear stored tokens
        await removeToken();
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    }
    bootstrap();
  }, []);

  // ── Listen for 401 session expiry from api.ts ──
  useEffect(() => {
    const unsubscribe = subscribeSessionExpired(() => {
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
      try {
        if (router.canGoBack()) {
          router.dismissAll();
        }
      } catch {}
      router.replace('/');
    });
    return unsubscribe;
  }, [router]);

  // ── Route guard: redirect based on auth state ──
  useEffect(() => {
    if (state.isLoading || !rootNavigationState?.key) return;

    const firstSegment = segments[0] as string | undefined;
    const secondSegment = segments[1] as string | undefined;

    const inAuthGroup = firstSegment === '(auth)';
    const inTabsGroup = firstSegment === '(tabs)';
    const inDoctorTabsGroup = firstSegment === '(doctor-tabs)';
    const inRootOnboarding = !firstSegment || firstSegment === 'index';

    // Critical: Do NOT redirect away from verification or password reset screens
    // when a token query parameter is actively being processed
    const isAuthActionRoute =
      inAuthGroup && (secondSegment === 'reset-password' || secondSegment === 'verify-email');

    if (isAuthActionRoute) {
      return;
    }

    if (state.isAuthenticated && (inAuthGroup || inRootOnboarding)) {
      // Logged in but on auth/onboarding screen → go to appropriate dashboard
      if (state.user?.role === 'DOCTOR') {
        router.replace('/(doctor-tabs)' as any);
      } else if (state.user?.role === 'PATIENT') {
        router.replace('/(tabs)');
      }
      // ADMIN will be kept on current screen and presented with AdminNoticeModal
    } else if (state.isAuthenticated && state.user?.role === 'DOCTOR' && inTabsGroup) {
      router.replace('/(doctor-tabs)' as any);
    } else if (state.isAuthenticated && state.user?.role === 'PATIENT' && inDoctorTabsGroup) {
      router.replace('/(tabs)');
    } else if (!state.isAuthenticated && (inTabsGroup || inDoctorTabsGroup)) {
      // Not logged in but on protected screen → dismiss nested tabs and go to onboarding
      try {
        if (router.canGoBack()) {
          router.dismissAll();
        }
      } catch {}
      router.replace('/');
    }
  }, [state.isAuthenticated, state.isLoading, state.user?.role, segments, router, rootNavigationState?.key]);

  const login = useCallback(async (email: string, password: string, turnstileToken?: string) => {
    const res = await api.post<{ token?: string; accessToken?: string; refreshToken?: string; user: User }>('/auth/login', {
      email,
      password,
      turnstileToken,
    });
    const authToken = res.data?.token || res.data?.accessToken;
    if (authToken && res.data?.user) {
      await saveTokens(authToken, res.data?.refreshToken);
      setState({
        user: res.data.user,
        token: authToken,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: 'PATIENT' | 'DOCTOR', turnstileToken?: string) => {
      const res = await api.post<{ token?: string; accessToken?: string; refreshToken?: string; user: User }>('/auth/register', {
        name,
        email,
        password,
        role,
        turnstileToken,
      });
      const authToken = res.data?.token || res.data?.accessToken;
      if (authToken && res.data?.user) {
        await saveTokens(authToken, res.data?.refreshToken);
        setState({
          user: res.data.user,
          token: authToken,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (googleToken: string) => {
    const res = await api.post<{ token?: string; accessToken?: string; refreshToken?: string; user: User }>('/auth/google', {
      token: googleToken,
    });
    const authToken = res.data?.token || res.data?.accessToken;
    if (authToken && res.data?.user) {
      await saveTokens(authToken, res.data?.refreshToken);
      setState({
        user: res.data.user,
        token: authToken,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);

  const loginWithToken = useCallback(async (authToken: string, refreshToken?: string) => {
    await saveTokens(authToken, refreshToken);
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.success && res.data) {
        setState({
          user: res.data.user,
          token: authToken,
          isLoading: false,
          isAuthenticated: true,
        });
      }
    } catch {
      setState({
        user: null,
        token: authToken,
        isLoading: false,
        isAuthenticated: true,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      await api.post('/auth/logout', { refreshToken }).catch(() => null);
    } catch {}
    try {
      await removeToken();
    } catch (e) {
      console.error('Failed to remove tokens during logout:', e);
    }
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    try {
      if (router.canGoBack()) {
        router.dismissAll();
      }
    } catch {}
    router.replace('/');
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      if (res.success && res.data) {
        setState((prev) => ({ ...prev, user: res.data!.user }));
      }
    } catch {
      // Silently fail
    }
  }, []);

  const isAdminUser = state.isAuthenticated && state.user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, loginWithGoogle, loginWithToken, logout, refreshUser }}
    >
      {children}
      {isAdminUser && (
        <Modal visible={true} transparent={false} animationType="fade">
          <View className="flex-1 bg-slate-900 justify-center items-center px-6">
            <View className="h-16 w-16 rounded-full bg-amber-500/20 border border-amber-500/40 items-center justify-center mb-6">
              <ShieldAlert size={36} color="#F59E0B" />
            </View>

            <Text className="font-inter-bold text-2xl text-white text-center mb-2">
              Admin Portal (Web Only)
            </Text>

            <Text className="font-inter text-sm text-slate-300 text-center leading-relaxed mb-6 max-w-[320px]">
              System administration, doctor verification audits, and clinical risk analytics are optimized for desktop management.
            </Text>

            <View className="w-full max-w-[320px] space-y-3">
              <Pressable
                onPress={() => {
                  Linking.openURL('https://curalink-056t.onrender.com/admin').catch(() => null);
                }}
                className="w-full flex-row items-center justify-center gap-2 bg-teal-600 active:bg-teal-700 py-3.5 rounded-xl shadow-sm"
              >
                <ExternalLink size={18} color="#FFFFFF" />
                <Text className="font-inter-semibold text-sm text-white">Open Admin Dashboard</Text>
              </Pressable>

              <Pressable
                onPress={logout}
                className="w-full flex-row items-center justify-center gap-2 bg-slate-800 active:bg-slate-700 border border-slate-700 py-3.5 rounded-xl"
              >
                <LogOut size={18} color="#CBD5E1" />
                <Text className="font-inter-semibold text-sm text-slate-200">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </AuthContext.Provider>
  );
}
