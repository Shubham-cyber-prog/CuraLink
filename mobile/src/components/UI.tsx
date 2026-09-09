import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTheme } from '../lib/theme-context';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-border dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5 shadow-sm shadow-slate-100 dark:shadow-none ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

export function Badge({ label, variant = 'default', className = '', ...props }: BadgeProps) {
  const { isDark } = useTheme();

  // Contrast-tested status colors for light and dark modes
  const variantConfig = {
    success: {
      bg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#D1FAE5',
      text: isDark ? '#34D399' : '#065F46',
    },
    warning: {
      bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
      text: isDark ? '#FBBF24' : '#92400E',
    },
    danger: {
      bg: isDark ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2',
      text: isDark ? '#F87171' : '#991B1B',
    },
    info: {
      bg: isDark ? 'rgba(59, 130, 246, 0.18)' : '#DBEAFE',
      text: isDark ? '#60A5FA' : '#1E40AF',
    },
    default: {
      bg: isDark ? 'rgba(148, 163, 184, 0.18)' : '#F1F5F9',
      text: isDark ? '#CBD5E1' : '#475569',
    },
  };

  const config = variantConfig[variant];

  return (
    <View
      className={`self-start rounded-full px-2.5 py-1 ${className}`}
      style={{ backgroundColor: config.bg }}
      {...props}
    >
      <Text
        className="font-inter-medium text-xs"
        style={{ color: config.text }}
      >
        {label}
      </Text>
    </View>
  );
}
