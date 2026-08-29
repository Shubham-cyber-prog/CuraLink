import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
}

/**
 * Reusable header for modal/stack screens.
 * White background, bottom border, safe area top padding.
 */
export function ScreenHeader({ title, onBack }: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View 
      style={{ 
        paddingTop: Math.max(insets.top, 16),
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
      }}
      className="flex-row items-center bg-white px-5 pb-4"
    >
      <Pressable
        onPress={handleBack}
        className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <ArrowLeft size={20} color="#1E293B" />
      </Pressable>
      <Text className="font-inter-semibold text-lg text-charcoal">{title}</Text>
    </View>
  );
}
