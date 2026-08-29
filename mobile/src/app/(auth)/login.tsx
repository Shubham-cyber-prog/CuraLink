import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
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
          {/* CuraLink Logo */}
          <View className="mb-8 items-center">
            <View 
              style={{
                shadowColor: '#0d9488',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
              className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-white border border-teal-100"
            >
              <Shield size={32} color="#0d9488" />
            </View>
            <Text className="font-inter-bold text-2xl text-charcoal">
              Cura<Text className="text-teal-600">Link</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
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

            <View className="mt-6">
              <Button
                title={isLoading ? "Signing you in..." : "Log in"}
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
                className="w-full"
              />
            </View>
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
