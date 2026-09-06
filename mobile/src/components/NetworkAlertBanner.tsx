import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { checkServerHealth, subscribeNetworkStatus } from '../lib/api';
import { getApiBaseUrl } from '../lib/api-config';

export function NetworkAlertBanner() {
  const insets = useSafeAreaInsets();
  const [isUnreachable, setIsUnreachable] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());

  useEffect(() => {
    // Initial health check on app mount
    checkServerHealth().then((ok) => {
      setIsUnreachable(!ok);
    });

    // Subscribe to ongoing network status from api calls
    const unsubscribe = subscribeNetworkStatus((reachable, url) => {
      setIsUnreachable(!reachable);
      if (url) setCurrentUrl(url);
    });

    return unsubscribe;
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    setCurrentUrl(getApiBaseUrl());
    const ok = await checkServerHealth();
    setIsUnreachable(!ok);
    setIsRetrying(false);
  };

  if (!isUnreachable) return null;

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 8) }}
      className="bg-amber-500 px-4 pb-3 border-b border-amber-600 shadow-md"
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-start gap-2.5 flex-1">
          <WifiOff size={20} color="#FFFFFF" style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="font-inter-bold text-xs text-white">
              Can't reach CuraLink Server
            </Text>
            <Text className="font-inter text-[11px] text-amber-100 leading-tight mt-0.5">
              Check backend server status & Wi-Fi network.
            </Text>
            <Text className="font-inter-medium text-[10px] text-amber-200 mt-1">
              Target: {currentUrl}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleRetry}
          disabled={isRetrying}
          className="flex-row items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full border border-white/30 active:bg-white/30"
        >
          {isRetrying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <RefreshCw size={12} color="#FFFFFF" />
              <Text className="font-inter-semibold text-xs text-white">Retry</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
