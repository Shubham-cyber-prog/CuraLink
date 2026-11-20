import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native';
import {
  ShieldAlert,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Server,
  Lock,
  Mail,
  Fingerprint,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView } from '../../components/Motion';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';

export default function AdminProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, setThemeMode } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ paddingTop: Math.max(insets.top + 10, 20) }}
          className="bg-white dark:bg-[#0B1F33] px-5 pb-5 border-b border-[#E6ECEF] dark:border-[#1B3650]"
        >
          <MotionView delay={30} className="flex-row items-center gap-4">
            <View className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 items-center justify-center">
              <ShieldAlert size={30} color="#D97706" />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5 mb-1">
                <Badge label="Super Admin" variant="warning" />
                <Badge label="Full RBAC" variant="default" />
              </View>
              <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white" numberOfLines={1}>
                {user?.name || 'Platform Administrator'}
              </Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {user?.email}
              </Text>
            </View>
          </MotionView>
        </View>

        <View className="px-5 pt-6 space-y-4">
          {/* Security & Access */}
          <MotionView delay={60}>
            <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Administrative Privileges
            </Text>
            <Card className="p-4 space-y-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5">
                  <ShieldCheck size={16} color="#059669" />
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                    Doctor Credential Approval
                  </Text>
                </View>
                <Badge label="Authorized" variant="success" />
              </View>

              <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                <View className="flex-row items-center gap-2.5">
                  <Server size={16} color="#2563EB" />
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                    Audit Logging &amp; Compliance
                  </Text>
                </View>
                <Badge label="DISHA Enforced" variant="default" />
              </View>

              <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                <View className="flex-row items-center gap-2.5">
                  <Lock size={16} color="#D97706" />
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                    Platform Role Level
                  </Text>
                </View>
                <Text className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                  ADMINISTRATOR
                </Text>
              </View>
            </Card>
          </MotionView>

          {/* Theme & Controls */}
          <MotionView delay={120}>
            <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Preferences
            </Text>
            <Card className="p-2">
              <View className="flex-row items-center justify-between p-3">
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                    {isDark ? <Moon size={17} color="#83C5BE" /> : <Sun size={17} color="#006D77" />}
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">Dark Theme</Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      High-contrast dark mode for low-light management
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                  trackColor={{ false: '#CBD5E1', true: '#D97706' }}
                />
              </View>
            </Card>
          </MotionView>

          {/* Sign Out Button */}
          <MotionView delay={180}>
            <TouchableOpacity
              onPress={() => setShowLogoutModal(true)}
              className="flex-row items-center justify-center gap-2 p-4 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
              activeOpacity={0.75}
            >
              <LogOut size={18} color="#E11D48" />
              <Text className="font-inter-bold text-sm text-rose-600 dark:text-rose-400">
                Sign Out of Admin Console
              </Text>
            </TouchableOpacity>
          </MotionView>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} animationType="fade" transparent onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <Card className="p-6 space-y-4">
            <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">Sign Out?</Text>
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">
              You will be signed out of the CuraLink Administrator Console and returned to the sign-in screen.
            </Text>
            <View className="flex-row gap-3 pt-2">
              <View className="flex-1">
                <Button title="Cancel" variant="outline" onPress={() => setShowLogoutModal(false)} />
              </View>
              <View className="flex-1">
                <Button
                  title="Sign Out"
                  variant="danger"
                  onPress={async () => {
                    setShowLogoutModal(false);
                    await logout();
                  }}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
