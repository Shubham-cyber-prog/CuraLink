import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth-context';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string;
    refreshToken?: string;
    error?: string;
  }>();
  const { loginWithToken } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function processCallback() {
      if (params.error) {
        setErrorMessage(decodeURIComponent(params.error));
        return;
      }

      if (params.token) {
        try {
          await loginWithToken(params.token, params.refreshToken);
        } catch {
          setErrorMessage('Failed to finalize authentication. Please try logging in again.');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }

    processCallback();
  }, [params.token, params.refreshToken, params.error, loginWithToken, router]);

  if (errorMessage) {
    return (
      <View className="flex-1 bg-white dark:bg-[#0B1120] items-center justify-center p-6">
        <View className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/60 items-center justify-center mb-4">
          <AlertCircle size={28} color="#E11D48" />
        </View>
        <Text className="font-inter-bold text-xl text-slate-900 dark:text-white text-center mb-2">
          Authentication Error
        </Text>
        <Text className="font-inter text-sm text-slate-500 dark:text-slate-400 text-center mb-6 max-w-[280px]">
          {errorMessage}
        </Text>
        <Button
          title="Return to Login"
          onPress={() => router.replace('/(auth)/login')}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-[#0B1120] items-center justify-center p-6">
      <ActivityIndicator size="large" color="#0D9488" />
      <Text className="font-inter-bold text-base text-slate-800 dark:text-slate-200 mt-4">
        Verifying secure credentials...
      </Text>
      <Text className="font-inter text-xs text-slate-400 mt-1">
        Finalizing session with CuraLink telehealth
      </Text>
    </View>
  );
}
