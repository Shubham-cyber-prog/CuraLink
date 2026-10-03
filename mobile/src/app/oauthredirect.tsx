import React, { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function OAuthRedirectHandler() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    router.replace({
      pathname: '/auth/callback' as any,
      params: params as any,
    });
  }, [params, router]);

  return (
    <View className="flex-1 bg-white dark:bg-[#0B1120] items-center justify-center">
      <ActivityIndicator size="small" color="#0D9488" />
    </View>
  );
}
