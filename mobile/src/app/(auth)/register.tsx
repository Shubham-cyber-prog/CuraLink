import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { UserCircle, Stethoscope, ArrowLeft } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { MotionView, MotionPressable } from '../../components/Motion';
import { PasswordStrength } from '../../components/PasswordStrength';
import { GoogleAuthButton } from '../../components/GoogleAuthButton';
import { TurnstileWidget } from '../../components/TurnstileWidget';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CuraLinkLogo } from '../../components/CuraLinkLogo';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) errors.name = 'Enter your full name (min 2 chars)';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address';
    if (!password || password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'At least 8 characters with 1 letter and 1 number';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    setError('');
    if (!validate()) return;
    if (!__DEV__ && !turnstileToken) {
      setError('Please complete the security check to continue');
      return;
    }

    setIsLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, role, turnstileToken || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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

            {/* Spacer for symmetrical centering */}
            <View style={{ width: 40 }} />
          </View>

          {/* Registration Card */}
          <MotionView delay={50}>
            <View className="rounded-3xl border border-[#E6ECEF] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33] p-5 shadow-sm shadow-slate-100 dark:shadow-none">
              <View className="mb-4">
                <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">
                  Create account
                </Text>
                <Text className="mt-0.5 font-inter text-xs text-slate-500 dark:text-slate-400">
                  Select your role to start booking consultations or managing clinical practice
                </Text>
              </View>

              {error ? (
                <View className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3">
                  <Text className="font-inter text-xs text-rose-600 dark:text-rose-300">{error}</Text>
                </View>
              ) : null}

              {/* Role Picker */}
              <View className="mb-4 flex-row gap-3">
                {[
                  { id: 'PATIENT', label: 'Patient Account', icon: UserCircle },
                  { id: 'DOCTOR', label: 'Doctor / Clinic', icon: Stethoscope },
                ].map((r) => {
                  const active = role === r.id;
                  const Icon = r.icon;
                  return (
                    <View key={r.id} className="flex-1">
                      <MotionPressable
                        onPress={() => setRole(r.id as any)}
                        className={`flex-row items-center justify-center gap-2 rounded-2xl border py-3 px-2 ${
                          active
                            ? 'border-[#006D77] bg-[#EAF4F5] dark:bg-[#112942] dark:border-[#83C5BE]'
                            : 'border-[#E6ECEF] dark:border-[#1B3650] bg-[#F8FAFB] dark:bg-[#06101B]'
                        }`}
                      >
                        <Icon size={17} color={active ? (isDark ? '#83C5BE' : '#006D77') : '#64748B'} />
                        <Text
                          className={`font-inter-bold text-xs ${
                            active ? 'text-[#006D77] dark:text-[#83C5BE]' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {r.label}
                        </Text>
                      </MotionPressable>
                    </View>
                  );
                })}
              </View>

              <Input
                label="Full Name"
                placeholder="Subham Nayak"
                autoCapitalize="words"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setFieldErrors((p) => ({ ...p, name: '' }));
                }}
                error={fieldErrors.name}
              />

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

              <View className="mb-2">
                <Input
                  label="Password"
                  placeholder="Min 8 chars (letters & numbers)"
                  isPassword
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setFieldErrors((p) => ({ ...p, password: '' }));
                  }}
                  error={fieldErrors.password}
                />
                <PasswordStrength password={password} />
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

              <View className="mt-3">
                <Button
                  title={isLoading ? 'Creating account...' : 'Create Account'}
                  onPress={handleRegister}
                  isLoading={isLoading}
                  disabled={isLoading || (!__DEV__ && !turnstileToken)}
                  className="w-full"
                />
              </View>

              <View className="my-4 flex-row items-center gap-3">
                <View className="flex-1 h-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
                <Text className="font-inter-medium text-[11px] text-slate-400">OR</Text>
                <View className="flex-1 h-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
              </View>

              <GoogleAuthButton label="Sign up with Google" role={role} onError={(msg) => setError(msg)} />
            </View>
          </MotionView>

          {/* Bottom Switch Link */}
          <View className="mt-5 flex-row justify-center pb-4">
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
