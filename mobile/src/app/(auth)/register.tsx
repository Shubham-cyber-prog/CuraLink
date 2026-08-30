import React from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Stethoscope, UserCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth-context';

// ── Validation schema ─────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['PATIENT', 'DOCTOR']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

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
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'PATIENT',
    },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await register(values.name, values.email, values.password, values.role);
      // Auth context handles redirect to /(tabs) on success
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.',
      );
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
            paddingTop: insets.top + 10,
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
            <View className="mb-6 items-center">
              <View
                style={{
                  shadowColor: '#0d9488',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.12,
                  shadowRadius: 14,
                  elevation: 8,
                }}
                className="mb-3 h-14 w-14 items-center justify-center rounded-2xl border border-teal-100 bg-white"
              >
                <Shield size={28} color="#0d9488" />
              </View>
              <Text className="font-inter-bold text-xl text-charcoal">
                Cura<Text className="text-teal-600">Link</Text>
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
              <View className="mb-4">
                <Text className="font-inter-bold text-xl text-charcoal">Create account</Text>
                <Text className="mt-1 font-inter text-xs text-muted">
                  Join CuraLink to get started
                </Text>
              </View>

              {/* Server error banner */}
              {serverError ? (
                <View className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
                  <Text className="font-inter text-xs text-red-600">{serverError}</Text>
                </View>
              ) : null}

              {/* Role selector (wired to RHF via Controller + watch/setValue) */}
              <Controller
                control={control}
                name="role"
                render={() => (
                  <View className="mb-5 flex-row gap-4">
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedRole === 'PATIENT' }}
                      onPress={() => setValue('role', 'PATIENT')}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border p-3.5 ${
                        selectedRole === 'PATIENT'
                          ? 'border-teal-600 bg-teal-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <UserCircle
                        size={20}
                        color={selectedRole === 'PATIENT' ? '#0d9488' : '#64748B'}
                      />
                      <Text
                        className={`font-inter-semibold text-xs ${
                          selectedRole === 'PATIENT' ? 'text-teal-700' : 'text-muted'
                        }`}
                      >
                        Patient
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedRole === 'DOCTOR' }}
                      onPress={() => setValue('role', 'DOCTOR')}
                      className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border p-3.5 ${
                        selectedRole === 'DOCTOR'
                          ? 'border-teal-600 bg-teal-50/50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Stethoscope
                        size={20}
                        color={selectedRole === 'DOCTOR' ? '#0d9488' : '#64748B'}
                      />
                      <Text
                        className={`font-inter-semibold text-xs ${
                          selectedRole === 'DOCTOR' ? 'text-teal-700' : 'text-muted'
                        }`}
                      >
                        Doctor
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />

              {/* Full name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    autoCapitalize="words"
                    autoComplete="name"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />

              {/* Email */}
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

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Min. 8 chars, 1 uppercase, 1 number"
                    isPassword
                    autoComplete="new-password"
                    returnKeyType="next"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

              {/* Confirm password */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    isPassword
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <View className="mt-2">
                <Button
                  title={isSubmitting ? 'Creating account…' : 'Create Account'}
                  onPress={handleSubmit(onSubmit)}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </View>
            </View>

            {/* Log in link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="font-inter text-sm text-muted">Already have an account? </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push('/(auth)/login')}
              >
                <Text className="font-inter-semibold text-sm text-teal-600">Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
