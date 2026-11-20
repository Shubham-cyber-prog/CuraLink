import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import type { PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  const sizeStyles = {
    sm: 'px-4 py-2.5',
    md: 'px-5 py-3.5',
    lg: 'px-6 py-4',
  };

  const variantStyles = {
    primary: 'bg-[#006D77]',
    secondary: isDark ? 'bg-[#112942] border border-[#1B3650]' : 'bg-[#EAF4F5] border border-[#C7E3E5]',
    outline: isDark ? 'bg-transparent border border-[#83C5BE]/60' : 'bg-transparent border border-[#006D77]',
    ghost: 'bg-transparent',
    danger: 'bg-rose-600',
  };

  const textColor = {
    primary: '#FFFFFF',
    secondary: isDark ? '#83C5BE' : '#006D77',
    outline: isDark ? '#83C5BE' : '#006D77',
    ghost: isDark ? '#83C5BE' : '#006D77',
    danger: '#FFFFFF',
  };

  const textSizeStyle = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSize = size === 'sm' ? 15 : 18;
  const iconColor = isPrimary || isDanger ? '#FFFFFF' : isDark ? '#83C5BE' : '#006D77';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={(e) => {
          scale.value = withSpring(0.96, { damping: 18, stiffness: 280 });
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          scale.value = withSpring(1, { damping: 18, stiffness: 280 });
          onPressOut?.(e);
        }}
        disabled={disabled || isLoading}
        className={`flex-row items-center justify-center rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${
          disabled || isLoading ? 'opacity-50' : 'opacity-100'
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={isPrimary || isDanger ? '#FFFFFF' : '#006D77'} size="small" />
        ) : (
          <View className="flex-row items-center gap-2">
            {Icon && iconPosition === 'left' && <Icon size={iconSize} color={iconColor} />}
            <Text className={`font-inter-semibold ${textSizeStyle[size]}`} style={{ color: textColor[variant] }}>
              {title}
            </Text>
            {Icon && iconPosition === 'right' && <Icon size={iconSize} color={iconColor} />}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
