import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
}

export function Input({ label, error, isPassword, className = '', ...props }: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="mb-2 font-inter-medium text-sm text-charcoal">
          {label}
        </Text>
      )}

      <View
        className={`
          flex-row items-center rounded-xl border bg-white px-4 py-3.5
          ${isFocused ? 'border-teal-500' : 'border-border'}
          ${error ? 'border-red-500' : ''}
        `}
      >
        <TextInput
          className="flex-1 font-inter text-base text-charcoal"
          placeholderTextColor="#94a3b8"
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} className="ml-2 p-1">
            {isPasswordVisible ? (
              <EyeOff size={20} color="#64748B" />
            ) : (
              <Eye size={20} color="#64748B" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="mt-1.5 font-inter text-sm text-red-500">
          {error}
        </Text>
      )}
    </View>
  );
}
