import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  User,
  Lock,
  LogOut,
  ChevronRight,
  ShieldCheck,
  FileText,
  X,
  Check,
  Sun,
  Moon,
  Smartphone,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Mail,
  Camera,
  Trash2,
  Sparkles,
  Upload,
} from 'lucide-react-native';
import {
  isNativeImagePickerAvailable,
  pickFromGallery,
  takePhotoWithCamera,
  uploadAvatarToBackend,
  deleteAvatarFromBackend,
} from '../../lib/avatar-picker';
import { PRESET_AVATARS } from '../../lib/preset-avatars';
import { resolveMediaUrl } from '../../lib/api-config';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView, MotionPressable } from '../../components/Motion';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  generateBiometricCredentialId,
  saveBiometricCredentials,
  clearBiometricCredentials,
} from '../../lib/biometric';

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
      className="flex-row items-center justify-between py-3.5 px-2.5"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3.5 flex-1">
        <View
          className={`h-10 w-10 items-center justify-center rounded-2xl ${
            danger ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-[#EAF4F5] dark:bg-[#112942]'
          }`}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text
            className={`font-inter-semibold text-sm ${
              danger ? 'text-rose-600 dark:text-rose-400' : 'text-[#0B1F33] dark:text-white'
            }`}
          >
            {label}
          </Text>
          {subtitle && (
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {!danger && <ChevronRight size={16} color="#94A3B8" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const { themeMode, setThemeMode, isDark, colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  // Modals state (100% real working modals only)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Real counts from backend
  const [completedVisits, setCompletedVisits] = useState(0);
  const [records, setRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Real editable profile state synced from /auth/me
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  // Real Security toggles
  const [biometricEnabled, setBiometricEnabled] = useState(Boolean(user?.biometricEnabled));
  const [biometricLabel, setBiometricLabel] = useState('Fingerprint');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isUpdatingBiometric, setIsUpdatingBiometric] = useState(false);
  const [biometricStatusMsg, setBiometricStatusMsg] = useState<string | null>(null);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(user?.twoFactorEnabled));
  const [twoFaSecret, setTwoFaSecret] = useState<string | null>(null);
  const [twoFaCodeInput, setTwoFaCodeInput] = useState('');
  const [twoFaBackupCodes, setTwoFaBackupCodes] = useState<string[]>([]);
  const [showDisable2FAInput, setShowDisable2FAInput] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);
  const [twoFaStatusMsg, setTwoFaStatusMsg] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const loadAccountStats = useCallback(async () => {
    try {
      const [meRes, apptsRes, rxRes] = await Promise.all([
        api.get<any>('/auth/me').catch(() => null),
        api.get<any[]>('/appointments/my-appointments').catch(() => null),
        api.get<any[]>('/prescriptions/my-prescriptions').catch(() => null),
      ]);

      const u = meRes?.data?.user || meRes?.data;
      if (u) {
        setName(u.name || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setAge(u.age ? String(u.age) : '');
        setGender(u.gender || 'Male');
        if (u.avatarUrl !== undefined) {
          setAvatarUrl(u.avatarUrl || null);
        }
        setBiometricEnabled(Boolean(u.biometricEnabled));
        setTwoFactorEnabled(Boolean(u.twoFactorEnabled));
      }

      if (Array.isArray(apptsRes?.data)) {
        setCompletedVisits(apptsRes.data.filter((a: any) => a.status === 'COMPLETED').length);
      }

      if (Array.isArray(rxRes?.data)) {
        setRecords(rxRes.data);
      }
    } catch {
      // Keep current values
    }
  }, []);

  useEffect(() => {
    loadAccountStats();
    checkBiometricAvailability().then((avail) => {
      setBiometricAvailable(avail.available);
      setBiometricLabel(avail.label);
    });
  }, [loadAccountStats]);

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

  const handleOpenAvatarModal = () => {
    setAvatarUploadMsg(null);
    setShowAvatarModal(true);
  };

  const handleApplyAvatarDataUrl = async (dataUrl: string, label?: string) => {
    setIsUploadingAvatar(true);
    setAvatarUploadMsg('Uploading photo to your CuraLink profile...');
    try {
      const res = await uploadAvatarToBackend(dataUrl);
      if (!res.success || !res.avatarUrl) {
        throw new Error(res.error || 'Failed to upload photo');
      }
      setAvatarUrl(res.avatarUrl);
      updateUser({ avatarUrl: res.avatarUrl });
      setAvatarUploadMsg('Photo updated successfully!');
      setTimeout(() => {
        setAvatarUploadMsg(null);
        setShowAvatarModal(false);
      }, 700);
    } catch (err: any) {
      setAvatarUploadMsg(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickFromGallery = async () => {
    setAvatarUploadMsg(null);
    const res = await pickFromGallery();
    if (res.isUnsupportedInExpoGo) {
      Alert.alert(
        'Gallery Access in Expo Go',
        'Device gallery access requires a custom native build (npx expo run:android). Please select any of the curated clinical avatars below or upload via the web dashboard at http://localhost:3000/settings!'
      );
      return;
    }
    if (!res.success) {
      if (res.error && res.error !== 'Cancelled') {
        Alert.alert('Notice', res.error);
      }
      return;
    }
    if (res.dataUrl) {
      await handleApplyAvatarDataUrl(res.dataUrl);
    }
  };

  const handleTakePhoto = async () => {
    setAvatarUploadMsg(null);
    const res = await takePhotoWithCamera();
    if (res.isUnsupportedInExpoGo) {
      Alert.alert(
        'Camera Access in Expo Go',
        'Device camera access requires a custom native build (npx expo run:android). Please select any of the curated clinical avatars below or upload via the web dashboard at http://localhost:3000/settings!'
      );
      return;
    }
    if (!res.success) {
      if (res.error && res.error !== 'Cancelled') {
        Alert.alert('Notice', res.error);
      }
      return;
    }
    if (res.dataUrl) {
      await handleApplyAvatarDataUrl(res.dataUrl);
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setIsUploadingAvatar(true);
          try {
            const res = await deleteAvatarFromBackend();
            if (!res.success) throw new Error(res.error || 'Failed to remove photo');
            setAvatarUrl(null);
            updateUser({ avatarUrl: null });
            setShowAvatarModal(false);
            Alert.alert('Profile Photo', 'Profile photo removed.');
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Could not remove photo.');
          } finally {
            setIsUploadingAvatar(false);
          }
        },
      },
    ]);
  };

  // Real PUT /auth/profile
  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setProfileFeedback('Name and email are required.');
      return;
    }
    setSavingProfile(true);
    setProfileFeedback(null);
    try {
      const res = await api.put<any>('/auth/profile', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        age: age.trim() ? Number(age.trim()) : undefined,
        gender: gender || undefined,
      });
      if (!res.success) {
        throw new Error(res.message || 'Could not update profile');
      }
      await refreshUser();
      setProfileFeedback('Profile saved to your account!');
      setTimeout(() => {
        setProfileFeedback(null);
        setShowEditProfileModal(false);
      }, 1000);
    } catch (err: any) {
      setProfileFeedback(err?.message || 'Failed to save profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Real POST /auth/forgot-password
  const handleSendPasswordReset = async () => {
    if (!email) return;
    setSendingReset(true);
    try {
      await api.post('/auth/forgot-password', { email });
      Alert.alert(
        'Reset Link Sent',
        `A secure password reset link has been sent to ${email}.`
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleToggleBiometric = async (nextVal: boolean) => {
    if (!user) return;
    setBiometricStatusMsg(null);
    setIsUpdatingBiometric(true);
    try {
      if (nextVal) {
        const avail = await checkBiometricAvailability();
        if (!avail.available) {
          setBiometricStatusMsg(
            'No Fingerprint / Biometric sensor enrolled on this device. Enable it in Phone Settings first.'
          );
          return;
        }
        const verified = await authenticateWithBiometrics(`Verify your ${avail.label} to enable quick sign-in`);
        if (!verified.success) {
          setBiometricStatusMsg(verified.error || 'Fingerprint verification cancelled.');
          return;
        }
        const credentialId = generateBiometricCredentialId();
        await api.post('/auth/biometric/register', { credentialId });
        await saveBiometricCredentials({
          email: user.email,
          name: user.name,
          credentialId,
        });
        setBiometricEnabled(true);
        setBiometricStatusMsg(`${avail.label} unlock enabled on this device!`);
        await refreshUser();
      } else {
        await api.delete('/auth/biometric/disable');
        await clearBiometricCredentials();
        setBiometricEnabled(false);
        setBiometricStatusMsg(`${biometricLabel} unlock disabled.`);
        await refreshUser();
      }
    } catch (err: unknown) {
      setBiometricStatusMsg(err instanceof Error ? err.message : 'Could not update biometric settings.');
    } finally {
      setIsUpdatingBiometric(false);
    }
  };

  const handleToggleTwoFactor = async (nextVal: boolean) => {
    setTwoFaStatusMsg(null);
    if (nextVal) {
      setIsUpdating2FA(true);
      try {
        const res = await api.post<{ secret: string; otpauthUri: string }>('/auth/2fa/setup', {});
        if (res.data?.secret) {
          setTwoFaSecret(res.data.secret);
          setTwoFaCodeInput('');
          setTwoFaBackupCodes([]);
          setTwoFaStatusMsg('Add this setup key in Google Authenticator / Authy, then enter the 6-digit code.');
        }
      } catch (err: unknown) {
        setTwoFaStatusMsg(err instanceof Error ? err.message : 'Failed to start 2FA setup');
      } finally {
        setIsUpdating2FA(false);
      }
    } else {
      setShowDisable2FAInput(true);
      setTwoFaCodeInput('');
    }
  };

  const handleConfirmEnable2FA = async () => {
    if (!/^\d{6}$/.test(twoFaCodeInput.trim())) {
      setTwoFaStatusMsg('Enter a valid 6-digit code from your authenticator app.');
      return;
    }
    setIsUpdating2FA(true);
    try {
      const res = await api.post<{ backupCodes?: string[] }>('/auth/2fa/verify-enable', {
        code: twoFaCodeInput.trim(),
      });
      setTwoFactorEnabled(true);
      setTwoFaSecret(null);
      setTwoFaCodeInput('');
      setTwoFaBackupCodes(res.data?.backupCodes || []);
      setTwoFaStatusMsg('2FA is now active! Save your backup codes below.');
      await refreshUser();
    } catch (err: unknown) {
      setTwoFaStatusMsg(err instanceof Error ? err.message : 'Invalid 6-digit code.');
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const handleConfirmDisable2FA = async () => {
    if (!twoFaCodeInput.trim()) {
      setTwoFaStatusMsg('Enter your 6-digit authenticator code or backup code.');
      return;
    }
    setIsUpdating2FA(true);
    try {
      await api.post('/auth/2fa/disable', { code: twoFaCodeInput.trim() });
      setTwoFactorEnabled(false);
      setShowDisable2FAInput(false);
      setTwoFaCodeInput('');
      setTwoFaBackupCodes([]);
      setTwoFaStatusMsg('Two-Factor Authentication disabled.');
      await refreshUser();
    } catch (err: unknown) {
      setTwoFaStatusMsg(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setIsUpdating2FA(false);
    }
  };

  const memberCode = `CL-${(user?.id || '000000').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`;

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 100, 115),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── CRISP LIGHT ACCOUNT HEADER ── */}
        <View
          style={{ paddingTop: Math.max(insets.top + 12, 22) }}
          className="bg-white dark:bg-[#0B1F33] px-5 pb-5 border-b border-[#E6ECEF] dark:border-[#1B3650]"
        >
          <MotionView delay={30} className="flex-row items-center gap-4">
            <View className="relative">
              <TouchableOpacity
                onPress={handleOpenAvatarModal}
                disabled={isUploadingAvatar}
                activeOpacity={0.8}
                className="h-20 w-20 items-center justify-center rounded-2xl overflow-hidden bg-[#EAF4F5] dark:bg-[#112942] border-2 border-[#006D77] dark:border-[#83C5BE]"
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color="#006D77" />
                ) : avatarUrl ? (
                  <Image
                    source={{ uri: resolveMediaUrl(avatarUrl) || '' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="font-inter-bold text-2xl text-[#006D77] dark:text-[#83C5BE]">
                    {(name || user?.name || 'P').charAt(0).toUpperCase()}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleOpenAvatarModal}
                disabled={isUploadingAvatar}
                activeOpacity={0.8}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#006D77] items-center justify-center border-2 border-white dark:border-[#0B1F33]"
              >
                <Camera size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-0.5">
                <View className="flex-row items-center gap-1 rounded-full bg-[#EAF4F5] dark:bg-[#112942] px-2.5 py-0.5">
                  <ShieldCheck size={11} color={isDark ? '#83C5BE' : '#006D77'} />
                  <Text className="font-inter-semibold text-[10px] text-[#006D77] dark:text-[#83C5BE]">Verified Member</Text>
                </View>
                <Text className="font-mono text-[10px] text-slate-400">{memberCode}</Text>
              </View>
              <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white" numberOfLines={1}>
                {name || user?.name || 'CuraLink Member'}
              </Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5" numberOfLines={1}>
                {email || user?.email}
              </Text>

              {/* Photo Upload / Change / Remove Buttons */}
              <View className="flex-row items-center gap-2 mt-2">
                <TouchableOpacity
                  onPress={handleOpenAvatarModal}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                  className="rounded-full bg-[#EAF4F5] dark:bg-[#112942] border border-[#C7E3E5] dark:border-[#163656] px-3 py-1 flex-row items-center gap-1.5"
                >
                  <Camera size={11} color={isDark ? '#83C5BE' : '#006D77'} />
                  <Text className="font-inter-bold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                    {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                  </Text>
                </TouchableOpacity>

                {avatarUrl && (
                  <TouchableOpacity
                    onPress={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    activeOpacity={0.8}
                    className="rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-2.5 py-1 flex-row items-center gap-1"
                  >
                    <Trash2 size={11} color="#E11D48" />
                    <Text className="font-inter-semibold text-[10px] text-rose-600 dark:text-rose-400">
                      Remove
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </MotionView>

          <MotionView delay={80} className="mt-4 flex-row rounded-2xl bg-[#F6F8F9] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 justify-around">
            <View className="items-center">
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">{completedVisits}</Text>
              <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">Completed</Text>
            </View>
            <View className="w-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
            <View className="items-center">
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">{records.length}</Text>
              <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">Prescriptions</Text>
            </View>
            <View className="w-px bg-[#E6ECEF] dark:bg-[#1B3650]" />
            <View className="items-center">
              <Text className="font-inter-bold text-base text-[#006D77] dark:text-[#83C5BE]">
                {twoFactorEnabled ? '2FA On' : biometricEnabled ? 'Bio On' : 'Active'}
              </Text>
              <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">Security</Text>
            </View>
          </MotionView>

          <MotionView delay={110} className="mt-3.5">
            <Button title="Edit Personal Information" variant="secondary" size="sm" onPress={() => setShowEditProfileModal(true)} />
          </MotionView>
        </View>

        {/* Settings Sections (100% Working Only) */}
        <View className="px-5 pt-6 space-y-5">
          <MotionView delay={190}>
            <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Medical Vault
            </Text>
            <Card className="p-2">
              <SettingsItem
                icon={<FileText size={18} color={colors.teal} />}
                label="Digital Prescriptions (e-Rx)"
                subtitle={`${records.length} issued prescription${records.length === 1 ? '' : 's'}`}
                onPress={() => {
                  fetchRecords();
                  setShowRecordsModal(true);
                }}
              />
            </Card>
          </MotionView>

          <MotionView delay={240}>
            <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Security &amp; Appearance
            </Text>
            <Card className="p-2">
              <SettingsItem
                icon={<Lock size={18} color={colors.teal} />}
                label="Fingerprint, 2FA & Password"
                subtitle={`${biometricEnabled ? `${biometricLabel} Active` : 'Biometrics Off'} • ${
                  twoFactorEnabled ? '2FA Protected' : '2FA Off'
                }`}
                onPress={() => setShowSecurityModal(true)}
              />
              <View className="border-b border-[#EDF3F4] dark:border-[#1B3650] mx-2.5" />
              <SettingsItem
                icon={isDark ? <Moon size={18} color="#83C5BE" /> : <Sun size={18} color="#006D77" />}
                label="Appearance & Theme"
                subtitle={`Active: ${
                  themeMode === 'system' ? 'System Default' : themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'
                }`}
                onPress={() => setShowThemeModal(true)}
              />
            </Card>
          </MotionView>

          <MotionView delay={290}>
            <Card className="p-2">
              <SettingsItem
                icon={<LogOut size={18} color="#E11D48" />}
                label="Sign Out of CuraLink"
                onPress={() => setShowLogoutModal(true)}
                danger
              />
            </Card>
          </MotionView>
        </View>
      </ScrollView>

      {/* 1. REAL EDIT PROFILE MODAL */}
      <Modal visible={showEditProfileModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 max-h-[85%]"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <User size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Edit Profile</Text>
              </View>
              <Pressable onPress={() => setShowEditProfileModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl border border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B] px-4 py-3 font-inter text-sm text-[#0B1F33] dark:text-white"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">Email Address</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="name@domain.com"
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl border border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B] px-4 py-3 font-inter text-sm text-[#0B1F33] dark:text-white"
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">Phone</Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#94A3B8"
                    className="rounded-2xl border border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B] px-4 py-3 font-inter text-sm text-[#0B1F33] dark:text-white"
                  />
                </View>
                <View className="w-24">
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">Age</Text>
                  <TextInput
                    value={age}
                    onChangeText={(t) => setAge(t.replace(/\D/g, '').slice(0, 3))}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor="#94A3B8"
                    className="rounded-2xl border border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B] px-4 py-3 font-inter text-sm text-[#0B1F33] dark:text-white"
                  />
                </View>
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">Gender</Text>
                <View className="flex-row gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <Pressable
                      key={g}
                      onPress={() => setGender(g)}
                      className={`flex-1 py-2.5 rounded-full border items-center ${
                        gender === g
                          ? 'border-[#006D77] bg-[#006D77]'
                          : 'border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B]'
                      }`}
                    >
                      <Text
                        className={`font-inter-semibold text-xs ${
                          gender === g ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {g}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {profileFeedback && (
                <View className="flex-row items-center gap-1.5 py-1">
                  <CheckCircle2 size={15} color="#10B981" />
                  <Text className="font-inter-medium text-xs text-emerald-600 dark:text-emerald-400">
                    {profileFeedback}
                  </Text>
                </View>
              )}

              <View className="pt-2">
                <Button
                  title={savingProfile ? 'Saving...' : 'Save Changes'}
                  isLoading={savingProfile}
                  onPress={handleSaveProfile}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. REAL SECURITY MODAL (Fingerprint + 2FA + Real Password Reset Email) */}
      <Modal visible={showSecurityModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 max-h-[88%]"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Lock size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Security &amp; 2FA</Text>
              </View>
              <Pressable onPress={() => setShowSecurityModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {/* Native Fingerprint */}
              <View className="py-2 border-b border-[#EDF3F4] dark:border-[#1B3650]">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-1.5">
                      <Fingerprint size={15} color={colors.teal} />
                      <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                        {biometricLabel} Unlock &amp; Sign-In
                      </Text>
                    </View>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {biometricAvailable
                        ? `Use your phone's ${biometricLabel} sensor on login & launch`
                        : 'Enroll a fingerprint in your phone settings first'}
                    </Text>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    disabled={isUpdatingBiometric}
                    onValueChange={handleToggleBiometric}
                    trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
                {biometricStatusMsg && (
                  <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE] mt-2">
                    {biometricStatusMsg}
                  </Text>
                )}
              </View>

              {/* Real TOTP 2FA */}
              <View className="py-2 border-b border-[#EDF3F4] dark:border-[#1B3650]">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <View className="flex-row items-center gap-1.5">
                      <KeyRound size={15} color={colors.teal} />
                      <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                        Two-Factor Authentication (2FA)
                      </Text>
                    </View>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {twoFactorEnabled
                        ? 'Active — requires 6-digit authenticator code on login'
                        : 'Protect logins with Google Authenticator or Authy'}
                    </Text>
                  </View>
                  <Switch
                    value={twoFactorEnabled || Boolean(twoFaSecret)}
                    disabled={isUpdating2FA}
                    onValueChange={handleToggleTwoFactor}
                    trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {twoFaStatusMsg && (
                  <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE] mt-2">
                    {twoFaStatusMsg}
                  </Text>
                )}

                {twoFaSecret && !twoFactorEnabled && (
                  <View className="mt-3 rounded-2xl border border-[#C7E3E5] dark:border-[#1B3650] bg-[#EAF4F5] dark:bg-[#112942] p-3.5 space-y-2.5">
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                      Authenticator Setup Key (Tap &amp; copy):
                    </Text>
                    <Text
                      selectable
                      className="font-mono text-xs text-[#006D77] dark:text-[#83C5BE] bg-white dark:bg-[#06101B] p-2.5 rounded-xl"
                    >
                      {twoFaSecret}
                    </Text>
                    <TextInput
                      value={twoFaCodeInput}
                      onChangeText={(t) => setTwoFaCodeInput(t.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="#94A3B8"
                      className="rounded-xl border border-[#E2E9EC] dark:border-[#1B3650] bg-white dark:bg-[#06101B] px-3.5 py-2.5 font-mono text-sm text-center text-[#0B1F33] dark:text-white"
                    />
                    <Button
                      title={isUpdating2FA ? 'Verifying...' : 'Verify & Activate 2FA'}
                      onPress={handleConfirmEnable2FA}
                      isLoading={isUpdating2FA}
                    />
                  </View>
                )}

                {showDisable2FAInput && twoFactorEnabled && (
                  <View className="mt-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-3.5 space-y-2.5">
                    <Text className="font-inter-semibold text-xs text-rose-700 dark:text-rose-300">
                      Enter 6-digit code or backup code to disable 2FA:
                    </Text>
                    <TextInput
                      value={twoFaCodeInput}
                      onChangeText={setTwoFaCodeInput}
                      placeholder="6-digit code or XXXX-XXXX"
                      placeholderTextColor="#94A3B8"
                      className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-[#06101B] px-3.5 py-2 font-mono text-sm text-[#0B1F33] dark:text-white"
                    />
                    <Button
                      title={isUpdating2FA ? 'Disabling...' : 'Confirm Disable 2FA'}
                      variant="danger"
                      onPress={handleConfirmDisable2FA}
                      isLoading={isUpdating2FA}
                    />
                  </View>
                )}

                {twoFaBackupCodes.length > 0 && (
                  <View className="mt-3 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-3.5">
                    <Text className="font-inter-bold text-xs text-amber-900 dark:text-amber-200 mb-1.5">
                      Save Your Backup Codes:
                    </Text>
                    <Text selectable className="font-mono text-xs text-amber-900 dark:text-amber-100 leading-5">
                      {twoFaBackupCodes.join('   •   ')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Real Password Reset Email */}
              <View className="pt-2 space-y-2">
                <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">Reset Password</Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  Send a verified password reset link to {email || user?.email}.
                </Text>
                <Button
                  title={sendingReset ? 'Sending Link...' : 'Email Password Reset Link'}
                  variant="outline"
                  icon={Mail}
                  isLoading={sendingReset}
                  onPress={handleSendPasswordReset}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. REAL THEME MODAL */}
      <Modal visible={showThemeModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-4 mb-4">
              <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Appearance &amp; Theme</Text>
              <Pressable onPress={() => setShowThemeModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <View className="space-y-3">
              {[
                { id: 'light', label: 'Light Mode', subtitle: 'Crisp clinical daylight palette', icon: Sun },
                { id: 'dark', label: 'Dark Mode', subtitle: 'Deep Navy low-glare palette', icon: Moon },
                { id: 'system', label: 'System Default', subtitle: 'Matches your device automatically', icon: Smartphone },
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
                        ? 'border-[#006D77] bg-[#EAF4F5] dark:bg-[#112942] dark:border-[#83C5BE]'
                        : 'border-[#E2E9EC] dark:border-[#1B3650] bg-[#F4F7F8] dark:bg-[#06101B]'
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className={`h-10 w-10 items-center justify-center rounded-xl ${
                          isSelected ? 'bg-[#006D77]' : 'bg-slate-200 dark:bg-[#112942]'
                        }`}
                      >
                        <IconComp size={19} color={isSelected ? '#FFFFFF' : '#64748B'} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">{opt.label}</Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">{opt.subtitle}</Text>
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

      {/* 4. REAL PRESCRIPTIONS MODAL */}
      <Modal visible={showRecordsModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 h-[75%]"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-4 mb-4">
              <View className="flex-row items-center gap-2">
                <FileText size={20} color={colors.teal} />
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Digital Prescriptions</Text>
              </View>
              <Pressable onPress={() => setShowRecordsModal(false)} className="p-1">
                <X size={20} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {loadingRecords ? (
                <View className="py-12 items-center">
                  <ActivityIndicator size="small" color="#006D77" />
                </View>
              ) : records.length === 0 ? (
                <View className="py-12 items-center">
                  <FileText size={32} color="#94A3B8" />
                  <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white mt-3">
                    No prescriptions issued yet
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                    Digital prescriptions from your consultations will appear here automatically.
                  </Text>
                </View>
              ) : (
                records.map((rx) => (
                  <Card key={rx.id} className="p-4 space-y-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white flex-1">
                        {rx.diagnosis || 'Clinical Prescription'}
                      </Text>
                      <Badge label="Verified Rx" variant="success" />
                    </View>
                    <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">
                      {rx.doctor?.name || 'Attending Physician'} •{' '}
                      {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </Text>
                    {rx.notes ? (
                      <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {rx.notes}
                      </Text>
                    ) : null}
                  </Card>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. LOGOUT CONFIRMATION MODAL */}
      <Modal visible={showLogoutModal} animationType="fade" transparent onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <Card className="p-6 space-y-4">
            <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">Sign Out?</Text>
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">
              You can sign right back in anytime with your password or Fingerprint.
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

      {/* 6. REAL PROFILE PHOTO & AVATAR MODAL */}
      <Modal
        visible={showAvatarModal}
        animationType="slide"
        transparent
        onRequestClose={() => !isUploadingAvatar && setShowAvatarModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 max-h-[88%]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-4 mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="h-10 w-10 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                  <Camera size={20} color="#006D77" />
                </View>
                <View>
                  <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                    Profile Photo
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                    Syncs with your CuraLink account across web &amp; mobile
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => !isUploadingAvatar && setShowAvatarModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              {/* Current Photo Preview */}
              <View className="items-center py-1">
                <View className="h-24 w-24 rounded-3xl overflow-hidden bg-[#EAF4F5] dark:bg-[#112942] border-2 border-[#006D77] dark:border-[#83C5BE] items-center justify-center">
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#006D77" />
                  ) : avatarUrl ? (
                    <Image
                      source={{ uri: resolveMediaUrl(avatarUrl) || '' }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="font-inter-bold text-3xl text-[#006D77] dark:text-[#83C5BE]">
                      {(name || user?.name || 'P').charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                {avatarUploadMsg && (
                  <View className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#83C5BE]/50">
                    <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE] text-center">
                      {avatarUploadMsg}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons: Camera & Device Gallery */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-[#006D77] border border-[#006D77]"
                >
                  <Camera size={15} color="#FFFFFF" />
                  <Text className="font-inter-bold text-xs text-white">Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#C7E3E5] dark:border-[#1B3650]"
                >
                  <Upload size={15} color={isDark ? '#83C5BE' : '#006D77'} />
                  <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                    Device Gallery
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Curated Avatars Section */}
              <View className="pt-1">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Sparkles size={14} color="#006D77" />
                  <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Curated Clinical &amp; Verified Avatars
                  </Text>
                </View>
                <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Tap any avatar to set it instantly on your account:
                </Text>

                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {PRESET_AVATARS.map((avatar) => {
                    const isSelected = avatarUrl && avatarUrl.includes(avatar.id);
                    return (
                      <TouchableOpacity
                        key={avatar.id}
                        onPress={() => handleApplyAvatarDataUrl(avatar.dataUrl, avatar.label)}
                        disabled={isUploadingAvatar}
                        activeOpacity={0.7}
                        style={{ width: '23%' }}
                        className={`items-center p-2 rounded-2xl border ${
                          isSelected
                            ? 'border-[#006D77] bg-[#EAF4F5] dark:bg-[#112942] dark:border-[#83C5BE]'
                            : 'border-[#E2E9EC] dark:border-[#1B3650] bg-[#F8FAFB] dark:bg-[#06101B]'
                        }`}
                      >
                        <View className="h-12 w-12 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-[#C7E3E5] dark:border-slate-700 items-center justify-center">
                          <Image
                            source={{ uri: avatar.dataUrl }}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                          />
                        </View>
                        <Text
                          className="font-inter-bold text-[10px] text-[#0B1F33] dark:text-white mt-1.5 text-center"
                          numberOfLines={1}
                        >
                          {avatar.label}
                        </Text>
                        <Text
                          className="font-inter text-[9px] text-slate-400 text-center"
                          numberOfLines={1}
                        >
                          {avatar.role}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Remove Button */}
              {avatarUrl && (
                <TouchableOpacity
                  onPress={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 mt-1"
                >
                  <Trash2 size={14} color="#E11D48" />
                  <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">
                    Remove Current Photo
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
