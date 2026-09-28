import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api } from '../../lib/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === 'string' ? params.token : '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      setGeneralError('Invalid or missing reset token.');
      return;
    }

    let hasError = false;
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      hasError = true;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setPasswordError('');
    setConfirmError('');
    setGeneralError('');
    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200">
            <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
              <Lock color="#0D9488" size={22} />
            </View>

            <Text className="font-inter-bold text-2xl text-charcoal">Set new password</Text>
            <Text className="mt-2 font-inter text-base leading-6 text-muted">
              Choose a strong password with at least 8 characters.
            </Text>

            {isSuccess ? (
              <View className="my-6 space-y-4">
                <View className="flex-row items-center gap-2 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2 color="#059669" size={20} />
                  <Text className="font-inter text-sm text-emerald-800 flex-1">
                    Password updated successfully. You can now log in with your new credentials.
                  </Text>
                </View>
                <Button title="Continue to Login" onPress={() => router.replace('/(auth)/login')} />
              </View>
            ) : (
              <View className="mt-6">
                {generalError ? (
                  <Text className="mb-4 rounded-xl bg-rose-50 p-3 font-inter text-xs text-rose-800">
                    {generalError}
                  </Text>
                ) : null}

                <Input
                  label="New Password"
                  placeholder="Min. 8 characters"
                  secureTextEntry
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    setPasswordError('');
                  }}
                  error={passwordError}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Repeat new password"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setConfirmError('');
                  }}
                  error={confirmError}
                />

                <Button title="Reset Password" onPress={handleSubmit} isLoading={isLoading} />

                <Button
                  title="Back to Login"
                  variant="outline"
                  onPress={() => router.replace('/(auth)/login')}
                  className="mt-3"
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
