import React from 'react';
import { View, Text } from 'react-native';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { label: 'Weak', color: '#EF4444', width: '25%' as const };
      case 2:
        return { label: 'Fair', color: '#F59E0B', width: '50%' as const };
      case 3:
        return { label: 'Good', color: '#0d9488', width: '75%' as const };
      case 4:
        return { label: 'Strong', color: '#10B981', width: '100%' as const };
      default:
        return { label: 'Weak', color: '#EF4444', width: '25%' as const };
    }
  };

  const strength = getStrength();

  return (
    <View className="mt-2 mb-1">
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="font-inter text-xs text-muted">Password strength:</Text>
        <Text className="font-inter-semibold text-xs" style={{ color: strength.color }}>
          {strength.label}
        </Text>
      </View>
      <View className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <View 
          className="h-full rounded-full"
          style={{ 
            width: strength.width, 
            backgroundColor: strength.color,
          }} 
        />
      </View>
    </View>
  );
}
