import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, UserCircle, Stethoscope } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../lib/auth-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register(name, email, password, role);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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
            paddingTop: insets.top + 10,
            paddingBottom: Math.max(insets.bottom, 24)
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* CuraLink Logo */}
          <View className="mb-6 items-center">
            <View 
              style={{
                shadowColor: '#0d9488',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
              className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white border border-teal-100"
            >
              <Shield size={28} color="#0d9488" />
            </View>
            <Text className="font-inter-bold text-xl text-charcoal">
              Cura<Text className="text-teal-600">Link</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <View className="mb-4">
              <Text className="font-inter-bold text-xl text-charcoal">Create account</Text>
              <Text className="mt-1 font-inter text-xs text-muted">
                Join CuraLink to get started
              </Text>
            </View>

            {error ? (
              <View className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3">
                <Text className="font-inter text-xs text-red-600">{error}</Text>
              </View>
            ) : null}

            {/* Role Selector */}
            <View className="mb-5 flex-row gap-4">
              <TouchableOpacity
                onPress={() => setRole('PATIENT')}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border p-3.5 ${
                  role === 'PATIENT' ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <UserCircle size={20} color={role === 'PATIENT' ? '#0d9488' : '#64748B'} />
                <Text
                  className={`font-inter-semibold text-xs ${role === 'PATIENT' ? 'text-teal-700' : 'text-muted'}`}
                >
                  Patient
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole('DOCTOR')}
                className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border p-3.5 ${
                  role === 'DOCTOR' ? 'border-teal-600 bg-teal-50/50' : 'border-slate-200 bg-white'
                }`}
              >
                <Stethoscope size={20} color={role === 'DOCTOR' ? '#0d9488' : '#64748B'} />
                <Text
                  className={`font-inter-semibold text-xs ${role === 'DOCTOR' ? 'text-teal-700' : 'text-muted'}`}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
              />

              <Input
                label="Email Address"
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                label="Password"
                placeholder="Create a strong password"
                isPassword
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="mt-6">
              <Button
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                className="w-full"
              />
            </View>
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="font-inter text-sm text-muted">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text className="font-inter-semibold text-sm text-teal-600">Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
