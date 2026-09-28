import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MailCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api } from '../../lib/api';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = typeof params.token === 'string' ? params.token : '';

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'expired' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    if (token) {
      handleVerifyToken(token);
    }
  }, [token]);

  const handleVerifyToken = async (tokenToVerify: string) => {
    setStatus('verifying');
    try {
      const res: any = await api.post('/auth/verify-email', { token: tokenToVerify });
      if (res?.success) {
        setStatus('success');
        setMessage(res.message || 'Your email address is verified.');
      } else {
        setStatus(res?.reason === 'EXPIRED' ? 'expired' : 'error');
        setMessage(res?.message || 'Verification token could not be verified.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Verification failed. Link may have expired.');
    }
  };

  const handleResend = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      setResendError('Enter a valid email address.');
      return;
    }

    setResendError('');
    setIsResending(true);
    setResendSuccess(false);

    try {
      await api.post('/auth/resend-verification', { email: resendEmail.trim().toLowerCase() });
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err.message || 'Unable to dispatch verification link.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200">
            <View className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
              <MailCheck color="#0D9488" size={22} />
            </View>

            <Text className="font-inter-bold text-2xl text-charcoal">Verify your email</Text>
            <Text className="mt-2 font-inter text-base leading-6 text-muted">
              CuraLink accounts require email verification to protect clinical records.
            </Text>

            {status === 'verifying' && (
              <View className="my-6 rounded-xl bg-teal-50 p-4">
                <Text className="font-inter text-sm text-teal-800">Verifying secure token...</Text>
              </View>
            )}

            {status === 'success' && (
              <View className="my-6 space-y-4">
                <View className="flex-row items-center gap-2 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2 color="#059669" size={20} />
                  <Text className="font-inter text-sm text-emerald-800 flex-1">{message}</Text>
                </View>
                <Button title="Continue to Login" onPress={() => router.replace('/(auth)/login')} />
              </View>
            )}

            {(status === 'expired' || status === 'error' || status === 'idle') && (
              <View className="mt-6">
                {status === 'expired' && (
                  <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-amber-50 p-3">
                    <AlertCircle color="#D97706" size={18} />
                    <Text className="font-inter text-xs text-amber-800 flex-1">
                      This link has expired. Enter your email below to request a fresh link.
                    </Text>
                  </View>
                )}

                <Input
                  label="Registered Email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={resendEmail}
                  onChangeText={(v) => {
                    setResendEmail(v);
                    setResendError('');
                  }}
                  error={resendError}
                />

                {resendSuccess && (
                  <Text className="mb-4 rounded-xl bg-emerald-50 p-3 font-inter text-xs text-emerald-800">
                    A verification link has been sent to your email.
                  </Text>
                )}

                <Button title="Send Verification Link" onPress={handleResend} isLoading={isResending} />

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
