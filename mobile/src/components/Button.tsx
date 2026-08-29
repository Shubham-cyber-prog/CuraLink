import React, { useState } from 'react';
import { Pressable, Text, ActivityIndicator, View, Animated } from 'react-native';
import type { PressableProps } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
  ...props
}: ButtonProps) {
  // Keep the animated value stable without reading a ref during render.
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isPrimary = variant === 'primary';

  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3.5',
    lg: 'px-6 py-4',
  };

  const variantStyles = {
    primary: 'bg-teal-600',
    secondary: 'bg-teal-50',
    outline: 'bg-transparent border border-teal-600',
    ghost: 'bg-transparent',
  };

  const textColor = {
    primary: '#FFFFFF',
    secondary: '#0f766e',
    outline: '#0d9488',
    ghost: '#0d9488',
  };

  const textSizeStyle = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSize = size === 'sm' ? 16 : 20;
  const iconColor = isPrimary ? '#FFFFFF' : '#0d9488';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        className={`
          flex-row items-center justify-center rounded-xl
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${(disabled || isLoading) ? 'opacity-50' : 'opacity-100'}
          ${className}
        `}
        style={({ pressed }) => ({
          opacity: pressed ? 0.9 : (disabled || isLoading) ? 0.5 : 1,
        })}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : '#0d9488'} size="small" />
        ) : (
          <View className="flex-row items-center gap-2">
            {Icon && iconPosition === 'left' && (
              <Icon size={iconSize} color={iconColor} />
            )}

            <Text
              className={`font-inter-semibold ${textSizeStyle[size]}`}
              style={{ color: textColor[variant] }}
            >
              {title}
            </Text>

            {Icon && iconPosition === 'right' && (
              <Icon size={iconSize} color={iconColor} />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
