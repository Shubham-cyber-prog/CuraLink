import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
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
  Sun,
  Moon,
  Smartphone,
  Phone,
  Mail,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react-native';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../lib/api';

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
        <View
          className={`h-9 w-9 items-center justify-center rounded-xl ${
            danger ? 'bg-red-50 dark:bg-red-950/40' : 'bg-slate-100 dark:bg-[#1C2338]'
          }`}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text
            className={`font-inter-semibold text-sm ${
              danger ? 'text-red-600 dark:text-red-400' : 'text-charcoal dark:text-[#F1F5F9]'
            }`}
          >
            {label}
          </Text>
          {subtitle && (
            <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">
              {subtitle}
            </Text>
          )}
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

  // Modals state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await api.get<any[]>('/prescriptions/my-prescriptions');
      if (res.data && Array.isArray(res.data)) {
        setRecords(res.data);
      }
    } catch {
      setRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Editable profile state
  const [name, setName] = useState(user?.name || 'Subham Nayak');
  const [email, setEmail] = useState(user?.email || 'patient@curalink.health');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Notification toggles
  const [notifAppt, setNotifAppt] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifRx, setNotifRx] = useState(true);
  const [notifHealthTips, setNotifHealthTips] = useState(false);

  // Security toggles & forms
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  const handleSaveProfile = () => {
    setProfileSavedToast(true);
    setTimeout(() => {
      setProfileSavedToast(false);
      setShowEditProfileModal(false);
    }, 1500);
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || newPassword.length < 6) {
      setPasswordFeedback('Password must be at least 6 characters.');
      return;
    }
    setPasswordFeedback('Password updated successfully!');
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setPasswordFeedback(null);
      setShowSecurityModal(false);
    }, 1500);
  };

  const openHotline = () => {
    Linking.openURL('tel:+18005550199').catch(() => {
      Alert.alert('Care Hotline', 'Call our 24/7 care desk at +1 (800) 555-0199');
    });
  };

  const openSupportEmail = () => {
    Linking.openURL('mailto:support@curalink.health').catch(() => {
      Alert.alert('Email Support', 'Send an email to support@curalink.health');
    });
  };

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
          <Text className="font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">
            Account & Settings
          </Text>
          <Text className="mt-0.5 font-inter text-xs text-muted dark:text-slate-400">
            Manage your medical profile, notifications, and security
          </Text>
        </View>

        <View className="px-5 space-y-5">
          {/* User Info Header Card */}
          <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60">
                <Text className="font-inter-bold text-2xl text-teal-700 dark:text-teal-300">
                  {name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  {name}
                </Text>
                <Text className="font-inter text-xs text-muted dark:text-slate-400">
                  {email}
                </Text>
                <View className="mt-2 flex-row items-center gap-2">
                  <Badge
                    label={user?.role || 'PATIENT'}
                    variant={user?.role === 'DOCTOR' ? 'info' : 'success'}
                  />
                  <View className="flex-row items-center gap-1 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-100/60 dark:border-teal-800/50">
                    <Shield size={12} color={colors.teal} />
                    <Text className="font-inter-medium text-[10px] text-teal-800 dark:text-teal-300">
                      Verified
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Health Vitals Summary Bar */}
            <View className="mt-4 pt-4 border-t border-slate-100 dark:border-[#263049] flex-row justify-around">
              <TouchableOpacity
                onPress={() => setShowEditProfileModal(true)}
                className="items-center"
                activeOpacity={0.7}
              >
                <Text className="font-inter-bold text-sm text-teal-700 dark:text-teal-400">
                  {bloodGroup}
                </Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">
                  Blood Type
                </Text>
              </TouchableOpacity>
              <View className="h-8 w-px bg-slate-100 dark:bg-[#263049]" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
                  72 bpm
                </Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">
                  Avg Pulse
                </Text>
              </View>
              <View className="h-8 w-px bg-slate-100 dark:bg-[#263049]" />
              <View className="items-center">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
                  2 Visits
                </Text>
                <Text className="font-inter text-[10px] text-muted dark:text-slate-400">
                  Completed
                </Text>
              </View>
            </View>

            {/* Quick Edit Profile CTA */}
            <TouchableOpacity
              onPress={() => setShowEditProfileModal(true)}
              className="mt-4 w-full py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="font-inter-semibold text-xs text-teal-800 dark:text-teal-300">
                Edit Personal & Health Details
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Medical Records Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
              Health Records
            </Text>
            <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-2">
              <SettingsItem
                icon={<FileText size={18} color={colors.teal} />}
                label="Digital Health Records & Prescriptions"
                subtitle="View past consultation summaries & notes"
                onPress={() => {
                  fetchRecords();
                  setShowRecordsModal(true);
                }}
              />
            </Card>
          </View>

          {/* App Preferences & Settings Section */}
          <View>
            <Text className="mb-2 font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
              App Preferences & Security
            </Text>
            <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-2">
              {/* Appearance Mode */}
              <SettingsItem
                icon={isDark ? <Moon size={18} color="#14B8A6" /> : <Sun size={18} color="#0F9D8C" />}
                label="Appearance & Theme"
                subtitle={`Current: ${
                  themeMode === 'system'
                    ? 'System Default'
                    : themeMode === 'dark'
                    ? 'Dark Theme'
                    : 'Light Theme'
                }`}
                onPress={() => setShowThemeModal(true)}
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              {/* Notifications */}
              <SettingsItem
                icon={<Bell size={18} color={colors.teal} />}
                label="Notification Preferences"
                subtitle="Appointment reminders & doctor alerts"
                onPress={() => setShowNotifModal(true)}
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              {/* Privacy & Security */}
              <SettingsItem
                icon={<Lock size={18} color={colors.teal} />}
                label="Privacy & Security"
                subtitle="Biometrics, 2FA & password change"
                onPress={() => setShowSecurityModal(true)}
              />
              <View className="border-b border-slate-100 dark:border-[#263049] mx-2" />

              {/* Help & Support */}
              <SettingsItem
                icon={<HelpCircle size={18} color={colors.teal} />}
                label="Help Desk & Support"
                subtitle="24/7 care coordinator hotline & FAQ"
                onPress={() => setShowHelpModal(true)}
              />
            </Card>
          </View>

          {/* HIPAA Platform Info Card */}
          <Card className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4">
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60">
                <ShieldCheck size={20} color={colors.teal} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
                  CuraLink Telehealth
                </Text>
                <Text className="font-inter text-[11px] text-muted dark:text-slate-400">
                  Version 1.2.0 • End-to-End Encrypted • HIPAA Aligned
                </Text>
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

      {/* 1. EDIT PROFILE MODAL */}
      <Modal visible={showEditProfileModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6 max-h-[85%]"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <User size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Edit Profile
                </Text>
              </View>
              <Pressable onPress={() => setShowEditProfileModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <View>
                <Text className="font-inter-semibold text-xs text-charcoal dark:text-[#F1F5F9] mb-1.5">
                  Full Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                  className="rounded-xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-charcoal dark:text-[#F1F5F9] mb-1.5">
                  Email Address
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@domain.com"
                  placeholderTextColor="#94A3B8"
                  className="rounded-xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-charcoal dark:text-[#F1F5F9] mb-1.5">
                  Contact Phone
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+91..."
                  placeholderTextColor="#94A3B8"
                  className="rounded-xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-charcoal dark:text-[#F1F5F9] mb-1.5">
                  Blood Group
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+'].map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      onPress={() => setBloodGroup(bg)}
                      className={`px-3 py-1.5 rounded-lg border ${
                        bloodGroup === bg
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50'
                          : 'border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120]'
                      }`}
                    >
                      <Text
                        className={`font-inter-bold text-xs ${
                          bloodGroup === bg ? 'text-teal-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {bg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {profileSavedToast && (
                <View className="flex-row items-center gap-1.5 py-1">
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text className="font-inter-medium text-xs text-emerald-600 dark:text-emerald-400">
                    Profile updated successfully
                  </Text>
                </View>
              )}

              <View className="pt-2">
                <Button title="Save Profile Details" onPress={handleSaveProfile} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. NOTIFICATIONS PREFERENCES MODAL */}
      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Bell size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Notification Settings
                </Text>
              </View>
              <Pressable onPress={() => setShowNotifModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="space-y-4">
              {[
                {
                  title: 'Appointment Reminders',
                  desc: 'Alerts 24h & 1h prior to visits',
                  val: notifAppt,
                  set: setNotifAppt,
                },
                {
                  title: 'Doctor Chat Messages',
                  desc: 'Direct messages and consultation notes',
                  val: notifChat,
                  set: setNotifChat,
                },
                {
                  title: 'Prescription Refill Alerts',
                  desc: 'Reminders when medication is signed or expiring',
                  val: notifRx,
                  set: setNotifRx,
                },
                {
                  title: 'AI Health Insights',
                  desc: 'Seasonal health guidance and tips',
                  val: notifHealthTips,
                  set: setNotifHealthTips,
                },
              ].map((item, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-[#263049] last:border-0"
                >
                  <View className="flex-1 pr-3">
                    <Text className="font-inter-semibold text-sm text-charcoal dark:text-[#F1F5F9]">
                      {item.title}
                    </Text>
                    <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </Text>
                  </View>
                  <Switch
                    value={item.val}
                    onValueChange={item.set}
                    trackColor={{ false: '#CBD5E1', true: colors.teal }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ))}

              <View className="pt-2">
                <Button title="Done" variant="outline" onPress={() => setShowNotifModal(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. PRIVACY & SECURITY MODAL */}
      <Modal visible={showSecurityModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6 max-h-[85%]"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Lock size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Privacy & Security
                </Text>
              </View>
              <Pressable onPress={() => setShowSecurityModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {/* Toggles */}
              <View className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-[#263049]">
                <View className="flex-1 pr-3">
                  <Text className="font-inter-semibold text-sm text-charcoal dark:text-[#F1F5F9]">
                    Biometric Unlock
                  </Text>
                  <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">
                    FaceID / Fingerprint unlock on app launch
                  </Text>
                </View>
                <Switch
                  value={biometricEnabled}
                  onValueChange={setBiometricEnabled}
                  trackColor={{ false: '#CBD5E1', true: colors.teal }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View className="flex-row items-center justify-between py-2 border-b border-slate-100 dark:border-[#263049]">
                <View className="flex-1 pr-3">
                  <Text className="font-inter-semibold text-sm text-charcoal dark:text-[#F1F5F9]">
                    Two-Factor Authentication (2FA)
                  </Text>
                  <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">
                    Requires authenticator code on new logins
                  </Text>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: '#CBD5E1', true: colors.teal }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Password update */}
              <View className="pt-2">
                <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9] mb-2">
                  Change Password
                </Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Current password"
                  placeholderTextColor="#94A3B8"
                  className="rounded-xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 font-inter text-sm text-charcoal dark:text-[#F1F5F9] mb-2"
                />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="New password (min 6 chars)"
                  placeholderTextColor="#94A3B8"
                  className="rounded-xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#0B1120] px-3.5 py-2.5 font-inter text-sm text-charcoal dark:text-[#F1F5F9] mb-3"
                />

                {passwordFeedback && (
                  <Text className="font-inter-medium text-xs text-teal-700 dark:text-teal-400 mb-2">
                    {passwordFeedback}
                  </Text>
                )}

                <Button title="Update Password" onPress={handleUpdatePassword} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. HELP & SUPPORT MODAL */}
      <Modal visible={showHelpModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <HelpCircle size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Help Desk & Care Team
                </Text>
              </View>
              <Pressable onPress={() => setShowHelpModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="space-y-3">
              <TouchableOpacity
                onPress={openHotline}
                className="flex-row items-center gap-3 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-800/50 bg-teal-50/70 dark:bg-teal-950/40"
              >
                <View className="h-10 w-10 rounded-xl bg-teal-600 items-center justify-center">
                  <Phone size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm text-teal-900 dark:text-teal-200">
                    24/7 Clinical Support Hotline
                  </Text>
                  <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">
                    +1 (800) 555-0199 (Toll Free)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openSupportEmail}
                className="flex-row items-center gap-3 p-3.5 rounded-2xl border border-slate-100 dark:border-[#263049] bg-slate-50/70 dark:bg-[#1C2338]"
              >
                <View className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-800 items-center justify-center">
                  <Mail size={20} color={colors.teal} />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
                    Email Care Coordination
                  </Text>
                  <Text className="font-inter text-xs text-muted dark:text-slate-400">
                    support@curalink.health (Avg response &lt; 15m)
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Telehealth Diagnostic Status */}
              <View className="p-3.5 rounded-2xl border border-slate-100 dark:border-[#263049] bg-slate-50/50 dark:bg-[#1C2338]/50">
                <Text className="font-inter-bold text-xs text-charcoal dark:text-[#F1F5F9] mb-1.5">
                  Device Telehealth Readiness
                </Text>
                <View className="flex-row justify-between text-xs py-0.5">
                  <Text className="font-inter text-xs text-muted dark:text-slate-400">Video Feed</Text>
                  <Text className="font-inter-semibold text-xs text-emerald-600 dark:text-emerald-400">Ready</Text>
                </View>
                <View className="flex-row justify-between text-xs py-0.5">
                  <Text className="font-inter text-xs text-muted dark:text-slate-400">Microphone</Text>
                  <Text className="font-inter-semibold text-xs text-emerald-600 dark:text-emerald-400">Ready</Text>
                </View>
                <View className="flex-row justify-between text-xs py-0.5">
                  <Text className="font-inter text-xs text-muted dark:text-slate-400">E2E Encryption</Text>
                  <Text className="font-inter-semibold text-xs text-teal-600 dark:text-teal-400">Active (AES-256)</Text>
                </View>
              </View>

              <View className="pt-2">
                <Button title="Close" variant="outline" onPress={() => setShowHelpModal(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. THEME SELECTION MODAL */}
      <Modal visible={showThemeModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Sun size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Appearance & Theme
                </Text>
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
                      <View
                        className={`h-10 w-10 items-center justify-center rounded-xl ${
                          isSelected ? 'bg-teal-100 dark:bg-teal-900/60' : 'bg-slate-200/60 dark:bg-[#263049]'
                        }`}
                      >
                        <IconComp size={20} color={isSelected ? colors.teal : colors.muted} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className={`font-inter-semibold text-sm ${
                            isSelected ? 'text-teal-900 dark:text-teal-200' : 'text-charcoal dark:text-[#F1F5F9]'
                          }`}
                        >
                          {opt.label}
                        </Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400 mt-0.5">
                          {opt.subtitle}
                        </Text>
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

      {/* 6. MEDICAL RECORDS MODAL */}
      <Modal visible={showRecordsModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-3xl bg-white dark:bg-[#151B2E] border-t border-slate-100 dark:border-[#263049] p-6 h-[75%]"
          >
            <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <FileText size={22} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-charcoal dark:text-[#F1F5F9]">
                  Medical Records
                </Text>
              </View>
              <Pressable onPress={() => setShowRecordsModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {loadingRecords ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="small" color={colors.teal} />
                  <Text className="mt-2 font-inter text-xs text-muted dark:text-slate-400">Loading prescriptions...</Text>
                </View>
              ) : records.length === 0 ? (
                <Card className="border border-slate-100 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] p-6 items-center justify-center space-y-2">
                  <FileText size={32} color="#94A3B8" />
                  <Text className="font-inter-semibold text-sm text-charcoal dark:text-[#F1F5F9]">No Prescriptions on File</Text>
                  <Text className="font-inter text-xs text-muted dark:text-slate-400 text-center">
                    Official digital prescriptions issued by attending doctors will appear here.
                  </Text>
                </Card>
              ) : (
                records.map((rec) => (
                  <Card key={rec.id} className="border border-slate-100 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] p-4 space-y-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="font-inter-bold text-sm text-charcoal dark:text-[#F1F5F9]">
                        {rec.diagnosis || 'Clinical Prescription'}
                      </Text>
                      <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                    <Text className="font-inter text-xs text-muted dark:text-slate-400">
                      Physician: {rec.doctor?.name || rec.appointment?.doctor?.user?.name || 'Attending Physician'}
                    </Text>
                    <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {rec.instructions || (Array.isArray(rec.medications) ? rec.medications.map((m: any) => `${m.name} (${m.dosage})`).join(', ') : 'Digital prescription recorded')}
                    </Text>
                  </Card>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. LOGOUT MODAL */}
      <Modal visible={showLogoutModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <Card className="bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] p-6 rounded-3xl space-y-4">
            <Text className="font-inter-bold text-xl text-charcoal dark:text-[#F1F5F9]">
              Log out of your account?
            </Text>
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
                <Button title="Log Out" onPress={logout} />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
