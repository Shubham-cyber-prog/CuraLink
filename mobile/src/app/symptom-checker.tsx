import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

/**
 * Root symptom-checker forwarder.
 * Redirects legacy links/navigation to the official AI Health tab screen.
 */
export default function SymptomCheckerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(tabs)/symptom-checker');
  }, [router]);

  return (
    <View className="flex-1 bg-white dark:bg-[#0B1120] items-center justify-center">
      <ActivityIndicator size="small" color="#0D9488" />
    </View>
  );
}
