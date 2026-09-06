import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { User, Bell, Lock, HelpCircle, LogOut, ChevronRight, Shield, FileText, X, Check, Activity, Heart, Award } from 'lucide-react-native';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth-context';
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
        <View className={`h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-red-50' : 'bg-slate-100'}`}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className={`font-inter-semibold text-sm ${danger ? 'text-red-600' : 'text-charcoal'}`}>
            {label}
          </Text>
          {subtitle && <Text className="font-inter text-xs text-muted mt-0.5">{subtitle}</Text>}
        </View>
      </View>
      {!danger && <ChevronRight size={16} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pb-5">
          <Text className="font-inter-bold text-2xl text-charcoal">Account & Profile</Text>
          <Text className="mt-0.5 font-inter text-xs text-muted">
            Manage medical profile, security, and preferences
          </Text>
        </View>

        <View className="px-5 space-y-5">
          {/* User Info Header Card */}
          <Card className="border border-slate-100 bg-white p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100">
                <User size={30} color="#0D9488" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-lg text-charcoal">
                  {user?.name || 'Patient User'}
                </Text>
                <Text className="font-inter text-xs text-muted">
                  {user?.email || 'patient@curalink.health'}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <Badge
                    label={user?.role || 'PATIENT'}
                    variant={user?.role === 'DOCTOR' ? 'info' : 'success'}
                  />
                  <View className="flex-row items-center gap-1 bg-teal-50 px-2 py-0.5 rounded-md">
                    <Shield size={12} color="#0D9488" />
                    <Text className="font-inter-medium text-[10px] text-teal-800">Verified</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Health Vitals Summary Bar */}
            <View className="mt-4 pt-4 border-t border-slate-100 flex-row justify-around">
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal">A+</Text>
                <Text className="font-inter text-[10px] text-muted">Blood Type</Text>
              </View>
              <View className="h-8 w-px bg-slate-100" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal">72 bpm</Text>
                <Text className="font-inter text-[10px] text-muted">Avg Pulse</Text>
              </View>
              <View className="h-8 w-px bg-slate-100" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal">2 Visits</Text>
                <Text className="font-inter text-[10px] text-muted">Completed</Text>
              </View>
            </View>
          </Card>

          {/* Medical Records Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal">Health Records</Text>
            <Card className="border border-slate-100 bg-white p-2">
              <SettingsItem
                icon={<FileText size={18} color="#0D9488" />}
                label="Digital Health Records & Prescriptions"
                subtitle="View past consultation summaries & notes"
                onPress={() => setShowRecordsModal(true)}
              />
            </Card>
          </View>

          {/* Account Settings Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal">App Preferences</Text>
            <Card className="border border-slate-100 bg-white p-2">
              <SettingsItem
                icon={<Bell size={18} color="#2563EB" />}
                label="Notification Settings"
                subtitle="Appointment reminders & prescription alerts"
              />
              <View className="border-b border-slate-100 mx-2" />

              <SettingsItem
                icon={<Lock size={18} color="#0D9488" />}
                label="Privacy & Security"
                subtitle="2FA authentication & biometric lock"
              />
              <View className="border-b border-slate-100 mx-2" />

              <SettingsItem
                icon={<HelpCircle size={18} color="#D97706" />}
                label="Help Desk & Support"
                subtitle="Contact 24/7 care coordination team"
              />
            </Card>
          </View>

          {/* App Info Card */}
          <Card className="border border-slate-100 bg-white p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
                <Shield size={18} color="#0D9488" />
              </View>
              <View>
                <Text className="font-inter-bold text-sm text-charcoal">CuraLink Mobile Platform</Text>
                <Text className="font-inter text-[11px] text-muted">Version 1.0.0 • HIPAA Compliant</Text>
              </View>
            </View>
          </Card>

          {/* Log Out CTA */}
          <Card className="border border-slate-100 bg-white p-2">
            <SettingsItem
              icon={<LogOut size={18} color="#EF4444" />}
              label="Log Out of CuraLink"
              onPress={() => setShowLogoutModal(true)}
              danger
            />
          </Card>
        </View>
      </ScrollView>

      {/* Medical Records Sheet Modal */}
      <Modal visible={showRecordsModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white p-6 h-[75%]"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <FileText size={22} color="#0D9488" />
                <Text className="font-inter-bold text-lg text-charcoal">Medical Records</Text>
              </View>
              <Pressable onPress={() => setShowRecordsModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <Card className="border border-slate-100 bg-slate-50 p-4 space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-charcoal">General Health Evaluation</Text>
                  <Text className="font-inter text-xs text-teal-700">Oct 12, 2026</Text>
                </View>
                <Text className="font-inter text-xs text-muted">Physician: Dr. Michael Chen</Text>
                <Text className="font-inter text-xs text-slate-700 leading-relaxed pt-1">
                  Diagnosis: Mild tension headache. Recommended hydration, rest, and follow-up if pain persists.
                </Text>
              </Card>

              <Card className="border border-slate-100 bg-slate-50 p-4 space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="font-inter-bold text-sm text-charcoal">Dermatology Skin Check</Text>
                  <Text className="font-inter text-xs text-teal-700">Sep 28, 2026</Text>
                </View>
                <Text className="font-inter text-xs text-muted">Physician: Dr. Sarah Jenkins</Text>
                <Text className="font-inter text-xs text-slate-700 leading-relaxed pt-1">
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
          <Card className="bg-white p-6 rounded-3xl space-y-4">
            <Text className="font-inter-bold text-xl text-charcoal">Log out of your account?</Text>
            <Text className="font-inter text-sm text-muted">
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
