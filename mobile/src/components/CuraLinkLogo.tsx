import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../lib/theme-context';

interface CuraLinkLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
  inverted?: boolean;
}

export function CuraLinkLogo({
  size = 'md',
  showSubtitle = false,
  subtitle = "India's #1 Telehealth",
  inverted = false,
}: CuraLinkLogoProps) {
  const { isDark } = useTheme();

  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 48,
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const imgSize = iconSizes[size];

  return (
    <View className="flex-row items-center gap-2.5">
      <View
        style={{ width: imgSize, height: imgSize }}
        className="items-center justify-center overflow-hidden"
      >
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: imgSize, height: imgSize }}
          resizeMode="contain"
        />
      </View>
      <View>
        <View className="flex-row items-baseline">
          <Text
            className={`font-inter-bold ${titleSizes[size]} tracking-tight ${
              inverted
                ? 'text-white'
                : isDark
                ? 'text-white'
                : 'text-[#0B1F33]'
            }`}
          >
            Cura<Text className="text-[#006D77] dark:text-[#83C5BE]">Link</Text>
          </Text>
        </View>
        {showSubtitle ? (
          <Text className="font-inter-medium text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-400 -mt-0.5">
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
