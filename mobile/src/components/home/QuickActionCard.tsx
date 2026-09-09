import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

interface QuickActionCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBackgroundClassName: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function QuickActionCard({
  icon: Icon,
  iconColor,
  iconBackgroundClassName,
  title,
  subtitle,
  onPress,
}: QuickActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      className="flex-1"
      onPress={onPress}
    >
      {({ pressed }) => (
        <View
          className={`min-h-36 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] p-4 shadow-sm shadow-slate-200 dark:shadow-none ${
            pressed ? 'bg-slate-50 dark:bg-[#1C2338]' : ''
          }`}
        >
          <View className={`mb-4 h-11 w-11 items-center justify-center rounded-xl ${iconBackgroundClassName}`}>
            <Icon color={iconColor} size={22} strokeWidth={2.25} />
          </View>
          <Text className="font-inter-semibold text-[15px] text-charcoal dark:text-[#F1F5F9]">{title}</Text>
          <Text className="mt-1 font-inter text-xs leading-5 text-muted dark:text-slate-400">{subtitle}</Text>
        </View>
      )}
    </Pressable>
  );
}
