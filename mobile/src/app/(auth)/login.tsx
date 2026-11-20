import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Fingerprint, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { MotionView, MotionPressable } from '../../components/Motion';
import { TurnstileWidget } from '../../components/TurnstileWidget';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';
import {
  checkBiometricAvailability,
  getBiometricCredentials,
  type MobileBiometricCred,
} from '../../lib/biometric';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CuraLinkLogo } from '../../components/CuraLinkLogo';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { login, verifyTwoFactorLogin, loginWithBiometric } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [twoFaChallenge, setTwoFaChallenge] = useState<{ tempToken: string; email: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');

  const [biometricCred, setBiometricCred] = useState<MobileBiometricCred | null>(null);
  const [biometricLabel, setBiometricLabel] = useState('Fingerprint');
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    async function loadBiometric() {
      const avail = await checkBiometricAvailability();
      setBiometricAvailable(avail.available);
      setBiometricLabel(avail.label);
      if (avail.available) {
        const stored = await getBiometricCredentials();
        setBiometricCred(stored);
      }
    }
    loadBiometric();
  }, []);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    setError('');
    if (!validate()) return;
    if (!__DEV__ && !turnstileToken) {
      setError('Please complete the security check to continue');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), password, turnstileToken || undefined);
      if (result?.requiresTwoFactor && result.tempToken) {
        setTwoFaChallenge({
          tempToken: result.tempToken,
          email: result.email || email.trim().toLowerCase(),
        });
        setTwoFaCode('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!twoFaChallenge) return;
    setError('');
    if (!twoFaCode.trim()) {
      setError('Enter the 6-digit authenticator code or backup code');
      return;
    }
    setIsLoading(true);
    try {
      await verifyTwoFactorLogin(twoFaChallenge.tempToken, twoFaCode.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSignIn = async () => {
    setError('');
    setIsBiometricLoading(true);
    try {
      await loginWithBiometric();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fingerprint login failed');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#06101B' : '#F6F8F9' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: Math.max(insets.top + 8, 16),
            paddingBottom: Math.max(insets.bottom + 24, 40),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back Button & Logo */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              activeOpacity={0.7}
              className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-[#0B1F33] border border-[#E6ECEF] dark:border-[#1B3650]"
            >
              <ArrowLeft size={18} color={isDark ? '#FFFFFF' : '#0B1F33'} />
            </TouchableOpacity>

            <CuraLinkLogo size="sm" />

            <View style={{ width: 40 }} />
          </View>

          {/* Login Card */}
          <MotionView delay={50}>
            <View className="rounded-3xl border border-[#E6ECEF] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33] p-5 shadow-sm shadow-slate-100 dark:shadow-none">
              {twoFaChallenge ? (
                <View>
                  <View className="mb-5">
                    <View className="mb-3 h-11 w-11 items-center justify-center rounded-xl bg-[#EAF4F5] dark:bg-[#112942]">
                      <ShieldCheck size={22} color={isDark ? '#83C5BE' : '#006D77'} />
                    </View>
                    <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">
                      Two-Factor Verification
                    </Text>
                    <Text className="mt-1 font-inter text-xs text-slate-500 dark:text-slate-400">
                      Enter the 6-digit code for {twoFaChallenge.email}
                    </Text>
                  </View>

                  {error ? (
                    <View className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3">
                      <Text className="font-inter text-xs text-rose-600 dark:text-rose-300">{error}</Text>
                    </View>
                  ) : null}

                  <Input
                    label="Authenticator or Backup Code"
                    placeholder="000000"
                    autoCapitalize="characters"
                    value={twoFaCode}
                    onChangeText={setTwoFaCode}
                  />

                  <View className="mt-3">
                    <Button
                      title={isLoading ? 'Verifying...' : 'Verify & Sign In'}
                      onPress={handleVerifyTwoFactor}
                      isLoading={isLoading}
                      disabled={isLoading}
                      className="w-full"
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setTwoFaChallenge(null);
                      setTwoFaCode('');
                      setError('');
                    }}
                    className="mt-4 flex-row items-center justify-center gap-1.5 py-2"
                  >
                    <ArrowLeft size={14} color="#64748B" />
                    <Text className="font-inter-semibold text-xs text-slate-500">Back to login</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="mb-4">
                    <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">Sign in</Text>
                    <Text className="mt-0.5 font-inter text-xs text-slate-500 dark:text-slate-400">
                      Access your consultations, medical vault, or clinical practice
                    </Text>
                  </View>

                  {error ? (
                    <View className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3">
                      <Text className="font-inter text-xs text-rose-600 dark:text-rose-300">{error}</Text>
                    </View>
                  ) : null}

                  {biometricAvailable && biometricCred && (
                    <MotionPressable
                      onPress={handleBiometricSignIn}
                      disabled={isBiometricLoading}
                      className="mb-4 flex-row items-center justify-center gap-2 rounded-2xl border border-[#006D77]/30 bg-[#EAF4F5] dark:bg-[#112942] py-3 px-4"
                    >
                      <Fingerprint size={19} color={isDark ? '#83C5BE' : '#006D77'} />
                      <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                        {isBiometricLoading ? `Scanning ${biometricLabel}...` : `Sign in with ${biometricLabel}`}
                      </Text>
                    </MotionPressable>
                  )}

                  <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                    error={fieldErrors.email}
                  />

                  <View>
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      isPassword
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        setFieldErrors((p) => ({ ...p, password: '' }));
                      }}
                      error={fieldErrors.password}
                    />
                    <View className="-mt-1 mb-3 flex-row justify-end">
                      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                        <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                          Forgot password?
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {!__DEV__ && (
                    <TurnstileWidget
                      onVerify={(token) => {
                        setTurnstileToken(token);
                        setError('');
                      }}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />
                  )}

                  <Button
                    title={isLoading ? 'Signing in...' : 'Sign In'}
                    onPress={handleLogin}
                    isLoading={isLoading}
                    disabled={isLoading || (!__DEV__ && !turnstileToken)}
                    className="w-full"
                  />

                  <View className="my-4 flex-row items-center gap-3">
                    <View className="flex-1 h-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
                    <Text className="font-inter-medium text-[11px] text-slate-400">OR</Text>
                    <View className="flex-1 h-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
                  </View>

                  <GoogleAuthButton label="Continue with Google" onError={(msg) => setError(msg)} />
                </>
              )}
            </View>
          </MotionView>

          {/* Bottom Switch Link */}
          <View className="mt-5 flex-row justify-center pb-4">
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">New to CuraLink? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
