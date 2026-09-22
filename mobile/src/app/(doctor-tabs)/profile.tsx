import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Stethoscope,
  ShieldCheck,
  Star,
  Award,
  DollarSign,
  Clock,
  Video,
  LogOut,
  Moon,
  Sun,
  Bell,
  FileCheck,
  ChevronRight,
  Mail,
  User,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { isDark, setThemeMode } = useTheme();

  const [telehealthActive, setTelehealthActive] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const doctorName = user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Physician';
  const doctorEmail = user?.email || 'doctor@curalink.health';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049]"
      >
        <Text className="font-inter-bold text-2xl text-slate-900 dark:text-[#F1F5F9]">Practice Profile</Text>
        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
          Doctor credentials, clinical settings & practice info
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Identity Card */}
        <Card className="p-5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-4">
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 items-center justify-center">
              <Stethoscope size={30} color={isDark ? '#2DD4BF' : '#085041'} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{doctorName}</Text>
                <ShieldCheck size={18} color="#0D9488" />
              </View>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doctorEmail}</Text>
              <View className="flex-row items-center gap-2 mt-2">
                <Badge label="Verified Clinician" variant="success" />
                <Badge label="MD / MBBS" variant="info" />
              </View>
            </View>
          </View>
        </Card>

        {/* Practice Highlights (4 metrics) */}
        <View className="flex-row flex-wrap gap-2.5">
          <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Star size={15} color="#EAB308" />
              <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Patient Rating</Text>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">4.95 / 5.0</Text>
            <Text className="font-inter text-[11px] text-slate-400 mt-0.5">142 reviews</Text>
          </Card>

          <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Award size={15} color="#0D9488" />
              <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Experience</Text>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">10+ Years</Text>
            <Text className="font-inter text-[11px] text-slate-400 mt-0.5">Specialist care</Text>
          </Card>

          <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center gap-1.5 mb-1">
              <DollarSign size={15} color="#059669" />
              <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Consultation Fee</Text>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">$90.00</Text>
            <Text className="font-inter text-[11px] text-slate-400 mt-0.5">Per 30-min visit</Text>
          </Card>

          <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Video size={15} color="#2563EB" />
              <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Telehealth</Text>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">Enabled</Text>
            <Text className="font-inter text-[11px] text-slate-400 mt-0.5">HD video calls</Text>
          </Card>
        </View>

        {/* Practice Preferences */}
        <View className="space-y-2.5">
          <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Practice Preferences</Text>

          <Card className="p-2 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] divide-y divide-slate-100 dark:divide-[#263049]">
            {/* Dark Mode Toggle */}
            <View className="flex-row items-center justify-between p-3">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-[#1C2338] items-center justify-center">
                  {isDark ? <Moon size={16} color="#38BDF8" /> : <Sun size={16} color="#F59E0B" />}
                </View>
                <View>
                  <Text className="font-inter-semibold text-sm text-slate-900 dark:text-[#F1F5F9]">Dark Theme</Text>
                  <Text className="font-inter text-xs text-slate-400">Reduce eye strain during night shifts</Text>
                </View>
              </View>
              <Switch
                value={isDark}
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                trackColor={{ false: '#CBD5E1', true: '#0D9488' }}
              />
            </View>

            {/* Telehealth Status Toggle */}
            <View className="flex-row items-center justify-between p-3">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                  <Video size={16} color="#0D9488" />
                </View>
                <View>
                  <Text className="font-inter-semibold text-sm text-slate-900 dark:text-[#F1F5F9]">Accept Video Visits</Text>
                  <Text className="font-inter text-xs text-slate-400">Patients can book video appointments</Text>
                </View>
              </View>
              <Switch
                value={telehealthActive}
                onValueChange={setTelehealthActive}
                trackColor={{ false: '#CBD5E1', true: '#0D9488' }}
              />
            </View>

            {/* Notifications Toggle */}
            <View className="flex-row items-center justify-between p-3">
              <View className="flex-row items-center gap-3">
                <View className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 items-center justify-center">
                  <Bell size={16} color="#2563EB" />
                </View>
                <View>
                  <Text className="font-inter-semibold text-sm text-slate-900 dark:text-[#F1F5F9]">Appointment Alerts</Text>
                  <Text className="font-inter text-xs text-slate-400">Instant alerts when patients book or check in</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#CBD5E1', true: '#0D9488' }}
              />
            </View>
          </Card>
        </View>

        {/* Clinical Verification Card */}
        <Card className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center">
              <FileCheck size={18} color="#059669" />
            </View>
            <View>
              <Text className="font-inter-semibold text-sm text-slate-900 dark:text-[#F1F5F9]">Medical License Verification</Text>
              <Text className="font-inter text-xs text-slate-400">Active & verified by State Medical Board</Text>
            </View>
          </View>
          <Badge label="Verified" variant="success" />
        </Card>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center gap-2 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 mt-2"
          activeOpacity={0.7}
        >
          <LogOut size={18} color="#E11D48" />
          <Text className="font-inter-bold text-sm text-rose-600 dark:text-rose-400">
            Sign Out of Doctor Portal
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} animationType="fade" transparent onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <Card className="bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] p-6 rounded-3xl space-y-4">
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
              Sign Out of Doctor Portal?
            </Text>
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">
              You will need to sign in again to access patient records, appointments, and consultations.
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
                <Button title="Sign Out" onPress={confirmLogout} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
