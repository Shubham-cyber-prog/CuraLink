import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-border bg-white p-5 shadow-sm shadow-slate-100 ${className}`}
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
  // Exact status colors from web design system
  const variantConfig = {
    success: { bg: '#D1FAE5', text: '#065F46' },    // green-100 / green-800
    warning: { bg: '#FEF3C7', text: '#92400E' },    // amber-100 / amber-800
    danger:  { bg: '#FEE2E2', text: '#991B1B' },    // red-100 / red-800
    info:    { bg: '#DBEAFE', text: '#1E40AF' },    // blue-100 / blue-800
    default: { bg: '#F1F5F9', text: '#475569' },    // slate-100 / slate-600
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
