import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Fingerprint, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { TurnstileWidget } from '../../components/TurnstileWidget';
import { useAuth } from '../../lib/auth-context';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';
import {
  checkBiometricAvailability,
  getBiometricCredentials,
  type MobileBiometricCred,
} from '../../lib/biometric';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logoImg from '../../../assets/images/logo.png';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, verifyTwoFactorLogin, loginWithBiometric } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Real 2FA Challenge State
  const [twoFaChallenge, setTwoFaChallenge] = useState<{ tempToken: string; email: string } | null>(null);
  const [twoFaCode, setTwoFaCode] = useState('');

  // Native Fingerprint State
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
      setError('Please complete the bot security check to continue');
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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTwoFactor = async () => {
    if (!twoFaChallenge) return;
    setError('');
    if (!twoFaCode.trim()) {
      setError('Enter the 6-digit code from your authenticator app or a backup code');
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
    <LinearGradient
      colors={['#F0FDFA', '#FFFFFF', '#FFFFFF']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            paddingHorizontal: 24, 
            justifyContent: 'center',
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, 24)
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CuraLink Logo (clean transparent mark) */}
          <View className="mb-6 items-center">
            <View className="mb-2 h-16 w-16 items-center justify-center">
              <Image
                source={logoImg}
                style={{ width: 64, height: 64 }}
                resizeMode="contain"
                alt="CuraLink Logo"
              />
            </View>
            <Text className="font-inter-bold text-2xl text-charcoal">
              Cura<Text className="text-teal-600">Link</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            {twoFaChallenge ? (
              <View>
                <View className="mb-5">
                  <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                    <ShieldCheck size={24} color="#006D77" />
                  </View>
                  <Text className="font-inter-bold text-2xl text-charcoal">Two-Factor Check</Text>
                  <Text className="mt-1 font-inter text-sm text-muted">
                    Enter the 6-digit authenticator code for {twoFaChallenge.email}
                  </Text>
                </View>

                {error ? (
                  <View className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 flex-row items-start gap-2">
                    <Text className="font-inter text-xs text-red-600 flex-1 leading-relaxed">{error}</Text>
                  </View>
                ) : null}

                <Input
                  label="Authenticator or Backup Code"
                  placeholder="000000"
                  keyboardType="default"
                  autoCapitalize="characters"
                  value={twoFaCode}
                  onChangeText={setTwoFaCode}
                />

                <View className="mt-4">
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
            <View className="mb-6">
              <Text className="font-inter-bold text-2xl text-charcoal">Welcome back</Text>
              <Text className="mt-1 font-inter text-sm text-muted">
                Sign in to access your account
              </Text>
            </View>

            {error ? (
              <View className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3.5 flex-row items-start gap-2">
                <Text className="font-inter text-xs text-red-600 flex-1 leading-relaxed">{error}</Text>
              </View>
            ) : null}

            {/* Real Native Mobile Fingerprint Sign-In */}
            {biometricAvailable && biometricCred && (
              <TouchableOpacity
                onPress={handleBiometricSignIn}
                disabled={isBiometricLoading}
                activeOpacity={0.8}
                className="mb-5 flex-row items-center justify-center gap-2.5 rounded-xl border border-teal-200 bg-teal-50/80 py-3.5 px-4"
              >
                <Fingerprint size={20} color="#006D77" />
                <Text className="font-inter-semibold text-sm text-[#006D77]">
                  {isBiometricLoading
                    ? `Scanning ${biometricLabel}...`
                    : `Sign in with ${biometricLabel}`}
                </Text>
              </TouchableOpacity>
            )}

            <View className="space-y-4">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => { setEmail(t); setFieldErrors((p) => ({ ...p, email: '' })); }}
                error={fieldErrors.email}
              />

              <View>
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  value={password}
                  onChangeText={(t) => { setPassword(t); setFieldErrors((p) => ({ ...p, password: '' })); }}
                  error={fieldErrors.password}
                />
                <View className="mt-1 flex-row justify-end">
                  <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text className="font-inter-semibold text-xs text-teal-600">Forgot password?</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Turnstile Bot Protection (hidden in dev) */}
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

            <View className="mt-4">
              <Button
                title={isLoading ? "Signing you in..." : "Log in"}
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading || (!__DEV__ && !turnstileToken)}
                className="w-full"
              />
            </View>

            {/* OR Divider */}
            <View className="my-5 flex-row items-center gap-3">
              <View className="flex-1 h-px bg-slate-100" />
              <Text className="font-inter-medium text-xs text-slate-400">OR</Text>
              <View className="flex-1 h-px bg-slate-100" />
            </View>

            <GoogleAuthButton
              label="Sign in with Google"
              onError={(msg) => setError(msg)}
            />
              </>
            )}
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="font-inter text-sm text-muted">Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="font-inter-semibold text-sm text-teal-600">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
