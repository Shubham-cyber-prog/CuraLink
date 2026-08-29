import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight, Shield } from 'lucide-react-native';
import { Card, Badge } from '../../components/UI';
import { useAuth } from '../../lib/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, label, onPress, danger }: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3.5">
        <View className={`h-8 w-8 items-center justify-center rounded-lg ${danger ? 'bg-red-50' : 'bg-slate-50'}`}>
          {icon}
        </View>
        <Text
          className={`font-inter-semibold text-sm ${danger ? 'text-red-600' : 'text-charcoal'}`}
        >
          {label}
        </Text>
      </View>
      {!danger && <ChevronRight size={16} color="#94a3b8" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ 
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: 40 
      }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-5 pb-6 pt-4">
        <Text className="font-inter-bold text-3xl text-charcoal">Profile</Text>
        <Text className="mt-1 font-inter text-sm text-muted">
          Manage your account settings and preferences
        </Text>
      </View>

      <View className="px-5 space-y-6">
        {/* User Info Card */}
        <Card className="border border-slate-100 bg-white">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
              <User size={28} color="#0d9488" />
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-xl text-charcoal">
                {user?.name || 'User'}
              </Text>
              <Text className="font-inter text-sm text-muted">
                {user?.email || 'user@example.com'}
              </Text>
              <View className="mt-2.5">
                <Badge
                  label={user?.role || 'PATIENT'}
                  variant={user?.role === 'DOCTOR' ? 'info' : 'success'}
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Settings Section */}
        <View>
          <Text className="mb-3 font-inter-semibold text-base text-charcoal">Account Settings</Text>
          <Card className="border border-slate-100 bg-white p-2">
            <SettingsItem
              icon={<Bell size={18} color="#0891B2" />}
              label="Notification Preferences"
            />
            <View className="border-b border-slate-100 mx-2" />

            <SettingsItem
              icon={<Lock size={18} color="#0891B2" />}
              label="Privacy & Encryption Settings"
            />
            <View className="border-b border-slate-100 mx-2" />

            <SettingsItem
              icon={<HelpCircle size={18} color="#0891B2" />}
              label="Help Desk & FAQ"
            />
          </Card>
        </View>

        {/* About Section */}
        <View>
          <Text className="mb-3 font-inter-semibold text-base text-charcoal">App Info</Text>
          <Card className="border border-slate-100 bg-white">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                <Shield size={18} color="#0d9488" />
              </View>
              <View>
                <Text className="font-inter-bold text-sm text-charcoal">CuraLink for Mobile</Text>
                <Text className="font-inter text-xs text-muted">Build version 1.0.0 (prod)</Text>
              </View>
            </View>
            <Text className="mt-4 font-inter text-xs leading-relaxed text-muted">
              HIPAA-aligned telehealth platform connecting patients with licensed healthcare professionals through AI-powered guidance.
            </Text>
          </Card>
        </View>

        {/* Logout */}
        <Card className="border border-slate-100 bg-white p-2">
          <SettingsItem
            icon={<LogOut size={18} color="#EF4444" />}
            label="Log Out Account"
            onPress={logout}
            danger
          />
        </Card>
      </View>
    </ScrollView>
  );
}
