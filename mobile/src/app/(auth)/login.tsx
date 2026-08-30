import React from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth-context';

// ── Validation schema ─────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [serverError, setServerError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Entrance animation — same Animated.Value pattern used throughout the project
  const [fadeAnim] = React.useState(() => new Animated.Value(0));
  const [slideAnim] = React.useState(() => new Animated.Value(20));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      // Auth context handles redirect to /(tabs) on success
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#F0FDFA', '#FFFFFF', '#FFFFFF']} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            justifyContent: 'center',
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 24),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Logo */}
            <View className="mb-8 items-center">
              <View
                style={{
                  shadowColor: '#0d9488',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 14,
                  elevation: 8,
                }}
                className="mb-4 h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-white"
              >
                <Shield size={32} color="#0d9488" />
              </View>
              <Text className="font-inter-bold text-2xl text-charcoal">
                Cura<Text className="text-teal-600">Link</Text>
              </Text>
              <Text className="mt-1 font-inter text-sm text-muted">
                Trusted healthcare, in your pocket
              </Text>
            </View>

            {/* Form card */}
            <View
              style={{
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
                elevation: 3,
              }}
              className="rounded-2xl border border-slate-100 bg-white p-6"
            >
              <View className="mb-6">
                <Text className="font-inter-bold text-2xl text-charcoal">Welcome back</Text>
                <Text className="mt-1 font-inter text-sm text-muted">
                  Sign in to access your account
                </Text>
              </View>

              {/* Server error banner */}
              {serverError ? (
                <View className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3.5">
                  <Text className="font-inter text-xs leading-relaxed text-red-600">
                    {serverError}
                  </Text>
                </View>
              ) : null}

              {/* Email field */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              {/* Password field + forgot password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <Input
                      label="Password"
                      placeholder="Enter your password"
                      isPassword
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                    />
                    <View className="mt-1 flex-row justify-end">
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/(auth)/forgot-password')}
                        hitSlop={8}
                      >
                        <Text className="font-inter-semibold text-xs text-teal-600">
                          Forgot password?
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />

              <View className="mt-6">
                <Button
                  title={isSubmitting ? 'Signing you in…' : 'Log in'}
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </View>
            </View>

            {/* Sign up link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="font-inter text-sm text-muted">
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push('/(auth)/register')}
              >
                <Text className="font-inter-semibold text-sm text-teal-600">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
