import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTheme } from '../lib/theme-context';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`rounded-[24px] border border-[#E2E9EC] dark:border-[#1B3650] bg-white dark:bg-[#0B1F33] p-5 shadow-sm shadow-slate-200/70 dark:shadow-none ${className}`}
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

  const variantConfig = {
    success: {
      bg: isDark ? 'rgba(16, 185, 129, 0.18)' : '#DCFCE7',
      text: isDark ? '#34D399' : '#065F46',
    },
    warning: {
      bg: isDark ? 'rgba(245, 158, 11, 0.18)' : '#FEF3C7',
      text: isDark ? '#FBBF24' : '#92400E',
    },
    danger: {
      bg: isDark ? 'rgba(244, 63, 94, 0.18)' : '#FFE4E6',
      text: isDark ? '#FDA4AF' : '#9F1239',
    },
    info: {
      bg: isDark ? 'rgba(131, 197, 190, 0.18)' : '#EAF4F5',
      text: isDark ? '#83C5BE' : '#006D77',
    },
    default: {
      bg: isDark ? 'rgba(148, 163, 184, 0.16)' : '#EDF3F4',
      text: isDark ? '#CBD5E1' : '#475569',
    },
  };

  const config = variantConfig[variant];

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${className}`}
      style={{ backgroundColor: config.bg }}
      {...props}
    >
      <Text className="font-inter-semibold text-[11px]" style={{ color: config.text }}>
        {label}
      </Text>
    </View>
  );
}
