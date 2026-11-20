import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotionPressable } from './Motion';
import { useTheme } from '../lib/theme-context';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={{ paddingTop: Math.max(insets.top + 8, 18) }}
      className="flex-row items-center bg-white dark:bg-[#0B1F33] px-4 pb-3.5 border-b border-[#E6ECEF] dark:border-[#1B3650]"
    >
      <MotionPressable
        onPress={handleBack}
        className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#F4F7F8] dark:bg-[#112942]"
      >
        <ArrowLeft size={19} color={isDark ? '#F3F7F9' : '#0B1F33'} />
      </MotionPressable>
      <View className="flex-1">
        <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-inter text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
