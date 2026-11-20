import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../lib/theme-context';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, className = '', ...props }: InputProps) {
  const { isDark } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-3.5 ${className}`}>
      {label && (
        <Text className="mb-1.5 font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-2xl border px-4 py-3 bg-[#F4F7F8] dark:bg-[#06101B] ${
          error
            ? 'border-rose-500'
            : isFocused
            ? 'border-[#006D77] dark:border-[#83C5BE] bg-white dark:bg-[#06101B]'
            : 'border-[#E2E9EC] dark:border-[#1B3650]'
        }`}
      >
        <TextInput
          className="flex-1 font-inter text-sm text-[#0B1F33] dark:text-white py-0"
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setIsPasswordVisible((v) => !v)} className="ml-2 p-1">
            {isPasswordVisible ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="mt-1 font-inter text-xs text-rose-500">{error}</Text>}
    </View>
  );
}
