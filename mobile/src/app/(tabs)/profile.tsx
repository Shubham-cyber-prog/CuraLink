import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import {
  User,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  FileText,
  X,
  Check,
  Activity,
  Heart,
  Award,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsItem({ icon, label, subtitle, onPress, danger }: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3.5 px-2"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3.5 flex-1">
        <View className={`h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-red-50 dark:bg-red-950/40' : 'bg-slate-100 dark:bg-[#1C2338]'}`}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className={`font-inter-semibold text-sm ${danger ? 'text-red-600 dark:text-red-400' : 'text-charcoal dark:text-[#F1F5F9]'}`}>
            {label}
          </Text>
          {subtitle && <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {!danger && <ChevronRight size={16} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-5">
          <Text className="font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">Account & Profile</Text>
          <Text className="mt-0.5 font-inter text-xs text-muted dark:text-slate-400">
            Manage medical profile, security, and preferences
          </Text>
        </View>

        <View className="px-5 space-y-5">
          {/* User Info Header Card */}
          <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60">
                <User size={30} color={colors.teal} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  {user?.name || 'Patient User'}
                </Text>
                <Text className="font-inter text-xs text-muted dark:text-slate-400">
                  {user?.email || 'patient@curalink.health'}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <Badge
                    label={user?.role || 'PATIENT'}
                    variant={user?.role === 'DOCTOR' ? 'info' : 'success'}
                  />
                  <View className="flex-row items-center gap-1 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100/60 dark:border-teal-800/50">
                    <Shield size={12} color={colors.teal} />
                    <Text className="font-inter-medium text-[10px] text-teal-800 dark:text-teal-300">Verified</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Health Vitals Summary Bar */}
            <View className="mt-4 pt-4 border-t border-slate-100 dark:border-[#263049] flex-row justify-around">
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">A+</Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">Blood Type</Text>
              </View>
              <View className="h-8 w-px bg-slate-100 dark:bg-[#263049]" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">72 bpm</Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">Avg Pulse</Text>
              </View>
              <View className="h-8 w-px bg-slate-100 dark:bg-[#263049]" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">2 Visits</Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">Completed</Text>
              </View>
            </View>
          </Card>

          {/* Medical Records Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">Health Records</Text>
            <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-2">
              <SettingsItem
                icon={<FileText size={18} color={colors.teal} />}
                label="Digital Health Records & Prescriptions"
                subtitle="View past consultation summaries & notes"
                onPress={() => setShowRecordsModal(true)}
              />
            </Card>
          </View>

          {/* Account Settings Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">App Preferences</Text>
            <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-2">
              {/* Appearance Mode Switcher Item */}
              <SettingsItem
                icon={isDark ? <Moon size={18} color="#14B8A6" /> : <Sun size={18} color="#F59E0B" />}
                label="Appearance & Theme"
                subtitle={`Current: ${themeMode === 'system' ? 'System Default' : themeMode === 'dark' ? 'Dark Theme' : 'Light Theme'}`}
                onPress={() => setShowThemeModal(true)}
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              <SettingsItem
                icon={<Bell size={18} color="#3B82F6" />}
                label="Notification Settings"
                subtitle="Appointment reminders & prescription alerts"
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              <SettingsItem
                icon={<Lock size={18} color={colors.teal} />}
                label="Privacy & Security"
                subtitle="2FA authentication & biometric lock"
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              <SettingsItem
                icon={<HelpCircle size={18} color="#D97706" />}
                label="Help Desk & Support"
                subtitle="Contact 24/7 care coordination team"
              />
            </Card>
          </View>

          {/* App Info Card */}
          <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60">
                <Shield size={18} color={colors.teal} />
              </View>
              <View>
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">CuraLink Mobile Platform</Text>
                <Text className="font-inter text-[11px] text-muted dark:text-slate-400">Version 1.0.0 • HIPAA Compliant</Text>
              </View>
            </View>
          </Card>

          {/* Log Out CTA */}
          <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-2">
            <SettingsItem
              icon={<LogOut size={18} color="#EF4444" />}
              label="Log Out of CuraLink"
              onPress={() => setShowLogoutModal(true)}
              danger
            />
          </Card>
        </View>
      </ScrollView>

      {/* Theme Selection Sheet Modal */}
      <Modal visible={showThemeModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Sun size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">Appearance</Text>
              </View>
              <Pressable onPress={() => setShowThemeModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="space-y-3">
              {[
                { id: 'light', label: 'Light Theme', subtitle: 'Clean, high-clarity daylight palette', icon: Sun },
                { id: 'dark', label: 'Dark Theme', subtitle: 'Calm deep navy palette, reduced eye strain', icon: Moon },
                { id: 'system', label: 'System Default', subtitle: 'Matches your device OS appearance automatically', icon: Smartphone },
              ].map((opt) => {
                const isSelected = themeMode === opt.id;
                const IconComp = opt.icon;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => {
                      setThemeMode(opt.id as any);
                      setShowThemeModal(false);
                    }}
                    className={`flex-row items-center justify-between p-4 rounded-2xl border ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40'
                        : 'border-slate-100 dark:border-[#263049] bg-slate-50/60 dark:bg-[#1C2338]/60'
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className={`h-10 w-10 items-center justify-center rounded-xl ${isSelected ? 'bg-teal-100 dark:bg-teal-900/60' : 'bg-slate-200/60 dark:bg-[#263049]'}`}>
                        <IconComp size={20} color={isSelected ? colors.teal : colors.muted} />
                      </View>
                      <View className="flex-1">
                        <Text className={`font-inter-semibold text-sm ${isSelected ? 'text-teal-900 dark:text-teal-200' : 'text-charcoal dark:text-[#F1F5F9]'}`}>
                          {opt.label}
                        </Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">{opt.subtitle}</Text>
                      </View>
                    </View>
                    {isSelected && <Check size={18} color={colors.teal} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Medical Records Sheet Modal */}
      <Modal visible={showRecordsModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6 h-[75%]"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <FileText size={22} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">Medical Records</Text>
              </View>
              <Pressable onPress={() => setShowRecordsModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <Card className="border border-slate-100 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] p-4 space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">General Health Evaluation</Text>
                  <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">Oct 12, 2026</Text>
                </View>
                <Text className="font-inter text-xs text-muted dark:text-slate-400">Physician: Dr. Michael Chen</Text>
                <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  Diagnosis: Mild tension headache. Recommended hydration, rest, and follow-up if pain persists.
                </Text>
              </Card>

              <Card className="border border-slate-100 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] p-4 space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">Dermatology Skin Check</Text>
                  <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">Sep 28, 2026</Text>
                </View>
                <Text className="font-inter text-xs text-muted dark:text-slate-400">Physician: Dr. Sarah Jenkins</Text>
                <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  Prescription issued for topically applied moisturizer. No malignant skin lesions detected.
                </Text>
              </Card>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <Card className="bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] p-6 rounded-3xl space-y-4">
            <Text className="font-inter-bold text-xl text-charcoal dark:text-[#F1F5F9]">Log out of your account?</Text>
            <Text className="font-inter text-sm text-muted dark:text-slate-400">
              You will need to enter your email and password to log back into CuraLink.
            </Text>
            <View className="flex-row gap-3 pt-2">
              <View className="flex-1">
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowLogoutModal(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  title="Log Out"
                  onPress={logout}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
