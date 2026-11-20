import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Pressable,
} from 'react-native';
import {
  Stethoscope,
  ShieldCheck,
  Award,
  Video,
  Building2,
  LogOut,
  Moon,
  Sun,
  Fingerprint,
  MapPin,
  IndianRupee,
  Edit3,
  Camera,
  X,
  Check,
  Sparkles,
  Upload,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView } from '../../components/Motion';
import { DoctorTopNav } from '../../components/DoctorTopNav';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { api } from '../../lib/api';
import { resolveMediaUrl } from '../../lib/api-config';
import {
  checkBiometricAvailability,
  authenticateWithBiometrics,
  generateBiometricCredentialId,
  saveBiometricCredentials,
  clearBiometricCredentials,
} from '../../lib/biometric';
import {
  pickFromGallery,
  takePhotoWithCamera,
  uploadAvatarToBackend,
  deleteAvatarFromBackend,
} from '../../lib/avatar-picker';
import { PRESET_AVATARS } from '../../lib/preset-avatars';

const PRESET_FEES = [299, 499, 799, 999, 1499, 1999];

export default function DoctorProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser, updateUser } = useAuth();
  const { isDark, setThemeMode, colors } = useTheme();

  const [loadingPractice, setLoadingPractice] = useState(true);
  const [savingMode, setSavingMode] = useState(false);
  const [practice, setPractice] = useState({
    specialization: 'General Practice',
    experienceYears: 5,
    consultationFee: 500,
    city: 'India',
    medicalLicenseNumber: 'NMC Verified',
    bio: '',
    consultationModes: ['VIDEO'] as string[],
    verificationStatus: 'APPROVED',
  });

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  // Fee Adjustment Modal
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeInput, setFeeInput] = useState('500');
  const [savingFee, setSavingFee] = useState(false);

  // Practice Edit Modal
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editBio, setEditBio] = useState('');
  const [savingPractice, setSavingPractice] = useState(false);

  // Biometrics & Logout
  const [biometricEnabled, setBiometricEnabled] = useState(Boolean(user?.biometricEnabled));
  const [biometricLabel, setBiometricLabel] = useState('Fingerprint');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const loadPractice = useCallback(async () => {
    try {
      const res = await api.get<any>('/doctors/me').catch(() => null);
      if (res?.data) {
        const d = res.data;
        const currentFee = d.consultationFee ?? 500;
        setPractice({
          specialization: d.specialization || 'General Practice',
          experienceYears: d.experienceYears ?? 5,
          consultationFee: currentFee,
          city: d.city || 'Online Telehealth',
          medicalLicenseNumber: d.medicalLicenseNumber || 'Verified',
          bio: d.bio || '',
          consultationModes:
            Array.isArray(d.consultationModes) && d.consultationModes.length > 0 ? d.consultationModes : ['VIDEO'],
          verificationStatus: d.verificationStatus || 'APPROVED',
        });
        setFeeInput(String(currentFee));
        setEditSpecialization(d.specialization || 'General Practice');
        setEditCity(d.city || '');
        setEditExperience(String(d.experienceYears ?? 5));
        setEditBio(d.bio || '');
      }
    } finally {
      setLoadingPractice(false);
    }
  }, []);

  useEffect(() => {
    loadPractice();
    if (user?.avatarUrl !== undefined) {
      setAvatarUrl(user.avatarUrl || null);
    }
    setBiometricEnabled(Boolean(user?.biometricEnabled));
    checkBiometricAvailability().then((avail) => setBiometricLabel(avail.label));
  }, [loadPractice, user?.biometricEnabled, user?.avatarUrl]);

  // Real PATCH /doctors/me/profile to adjust Consultation Fee
  const handleSaveFee = async () => {
    const num = parseFloat(feeInput.trim());
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Fee', 'Please enter a valid consultation fee in ₹ (e.g. 500).');
      return;
    }
    setSavingFee(true);
    try {
      const res = await api.patch<any>('/doctors/me/profile', {
        consultationFee: num,
        specialization: practice.specialization,
        experienceYears: practice.experienceYears,
        consultationModes: practice.consultationModes,
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to update consultation fee');
      }
      setPractice((prev) => ({ ...prev, consultationFee: num }));
      setShowFeeModal(false);
      Alert.alert('Fee Updated', `Your consultation fee is now updated to ₹${num} across CuraLink.`);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not update consultation fee.');
    } finally {
      setSavingFee(false);
    }
  };

  // Real PATCH /doctors/me/profile to edit practice details
  const handleSavePracticeDetails = async () => {
    setSavingPractice(true);
    try {
      const res = await api.patch<any>('/doctors/me/profile', {
        specialization: editSpecialization.trim() || practice.specialization,
        city: editCity.trim() || undefined,
        experienceYears: editExperience.trim() ? Number(editExperience.trim()) : practice.experienceYears,
        bio: editBio.trim() || undefined,
        consultationFee: practice.consultationFee,
        consultationModes: practice.consultationModes,
      });
      if (!res.success) {
        throw new Error(res.message || 'Failed to update practice details');
      }
      setPractice((prev) => ({
        ...prev,
        specialization: editSpecialization.trim() || prev.specialization,
        city: editCity.trim() || prev.city,
        experienceYears: editExperience.trim() ? Number(editExperience.trim()) : prev.experienceYears,
        bio: editBio.trim() || prev.bio,
      }));
      setShowPracticeModal(false);
      Alert.alert('Profile Saved', 'Your practice information was updated successfully.');
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not update practice details.');
    } finally {
      setSavingPractice(false);
    }
  };

  // Real PATCH /doctors/me/profile when toggling Video / Clinic modes
  const handleToggleMode = async (mode: 'VIDEO' | 'IN_PERSON') => {
    const exists = practice.consultationModes.includes(mode);
    if (exists && practice.consultationModes.length === 1) {
      Alert.alert('Required', 'At least one consultation mode must stay enabled.');
      return;
    }

    const nextModes = exists
      ? practice.consultationModes.filter((m) => m !== mode)
      : [...practice.consultationModes, mode];

    setSavingMode(true);
    try {
      await api.patch('/doctors/me/profile', {
        specialization: practice.specialization,
        consultationFee: practice.consultationFee,
        experienceYears: practice.experienceYears,
        consultationModes: nextModes,
      });
      setPractice((prev) => ({ ...prev, consultationModes: nextModes }));
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not update practice settings.');
    } finally {
      setSavingMode(false);
    }
  };

  // Avatar Handlers
  const handleApplyAvatarDataUrl = async (dataUrl: string) => {
    setIsUploadingAvatar(true);
    setAvatarUploadMsg('Updating your photo across CuraLink...');
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
      setAvatarUploadMsg(err?.message || 'Upload failed');
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
        'Device gallery access requires a custom native build. Please select any of our clinical avatars below!'
      );
      return;
    }
    if (res.success && res.dataUrl) {
      await handleApplyAvatarDataUrl(res.dataUrl);
    }
  };

  const handleTakePhoto = async () => {
    setAvatarUploadMsg(null);
    const res = await takePhotoWithCamera();
    if (res.isUnsupportedInExpoGo) {
      Alert.alert(
        'Camera Access in Expo Go',
        'Device camera access requires a custom native build. Please select any of our clinical avatars below!'
      );
      return;
    }
    if (res.success && res.dataUrl) {
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

  // Biometrics
  const handleToggleBiometric = async (nextVal: boolean) => {
    if (!user) return;
    setIsUpdatingBio(true);
    try {
      if (nextVal) {
        const avail = await checkBiometricAvailability();
        if (!avail.available) {
          Alert.alert('Biometrics Unavailable', 'Enroll a Fingerprint in your phone Settings first.');
          return;
        }
        const ok = await authenticateWithBiometrics(`Verify your ${avail.label} to enable quick sign-in`);
        if (!ok.success) return;
        const credentialId = generateBiometricCredentialId();
        await api.post('/auth/biometric/register', { credentialId });
        await saveBiometricCredentials({ email: user.email, name: user.name, credentialId });
        setBiometricEnabled(true);
        await refreshUser();
      } else {
        await api.delete('/auth/biometric/disable');
        await clearBiometricCredentials();
        setBiometricEnabled(false);
        await refreshUser();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not update biometric login.');
    } finally {
      setIsUpdatingBio(false);
    }
  };

  const doctorName = user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Clinician';

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      {/* ── TOP DOCTOR NAVIGATION BAR ── */}
      <DoctorTopNav currentTab="profile" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 100, 115) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Header */}
        <View className="bg-white dark:bg-[#0B1F33] px-5 py-4 border-b border-[#E6ECEF] dark:border-[#1B3650]">
          <MotionView delay={30} className="flex-row items-center gap-4">
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowAvatarModal(true)}
                activeOpacity={0.8}
                className="h-16 w-16 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center overflow-hidden border-2 border-[#006D77] dark:border-[#83C5BE]"
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: resolveMediaUrl(avatarUrl) || '' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Stethoscope size={26} color={isDark ? '#83C5BE' : '#006D77'} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAvatarModal(true)}
                activeOpacity={0.8}
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#006D77] items-center justify-center border-2 border-white dark:border-[#0B1F33]"
              >
                <Camera size={11} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white" numberOfLines={1}>
                  {doctorName}
                </Text>
                <ShieldCheck size={16} color="#006D77" />
              </View>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</Text>
              <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE] mt-0.5">
                {practice.specialization}
              </Text>
            </View>
          </MotionView>

          {/* Interactive Metric / Fee Pill Cards */}
          {!loadingPractice && (
            <MotionView delay={80} className="mt-4 flex-row rounded-2xl bg-[#F6F8F9] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 justify-around items-center">
              {/* Fee with Quick Adjust Trigger */}
              <TouchableOpacity
                onPress={() => {
                  setFeeInput(String(practice.consultationFee));
                  setShowFeeModal(true);
                }}
                activeOpacity={0.7}
                className="items-center px-3 py-1 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#006D77]/20"
              >
                <View className="flex-row items-center gap-1">
                  <Text className="font-inter-bold text-base text-[#006D77] dark:text-[#83C5BE]">
                    ₹{practice.consultationFee}
                  </Text>
                  <Edit3 size={11} color={isDark ? '#83C5BE' : '#006D77'} />
                </View>
                <Text className="font-inter-semibold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                  Tap to Adjust Fee
                </Text>
              </TouchableOpacity>

              <View className="w-px h-8 bg-[#E6ECEF] dark:bg-[#1B3650]" />

              <View className="items-center">
                <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                  {practice.experienceYears}+ yrs
                </Text>
                <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">Experience</Text>
              </View>

              <View className="w-px h-8 bg-[#E6ECEF] dark:bg-[#1B3650]" />

              <View className="items-center">
                <Text className="font-inter-bold text-base text-emerald-600 dark:text-emerald-400">
                  {practice.verificationStatus}
                </Text>
                <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400">NMC Status</Text>
              </View>
            </MotionView>
          )}

          {/* Action Row: Adjust Fee & Edit Details */}
          <View className="mt-3.5 flex-row gap-2.5">
            <TouchableOpacity
              onPress={() => {
                setFeeInput(String(practice.consultationFee));
                setShowFeeModal(true);
              }}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#006D77] border border-[#006D77]"
            >
              <IndianRupee size={15} color="#FFFFFF" />
              <Text className="font-inter-bold text-xs text-white">Adjust Fee (₹{practice.consultationFee})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPracticeModal(true)}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#C7E3E5] dark:border-[#163656]"
            >
              <Edit3 size={15} color={isDark ? '#83C5BE' : '#006D77'} />
              <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">Edit Practice</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 pt-5 space-y-4">
          {loadingPractice ? (
            <ActivityIndicator size="small" color="#006D77" />
          ) : (
            <>
              {/* Practice Summary Card */}
              <MotionView delay={120}>
                <Card className="p-4 space-y-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <Award size={16} color={colors.teal} />
                      <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                        Medical License
                      </Text>
                    </View>
                    <Text className="font-mono text-xs font-semibold text-[#0B1F33] dark:text-white">
                      {practice.medicalLicenseNumber}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                    <View className="flex-row items-center gap-2">
                      <MapPin size={16} color={colors.teal} />
                      <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                        Practice City
                      </Text>
                    </View>
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                      {practice.city}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                    <View className="flex-row items-center gap-2">
                      <IndianRupee size={16} color="#006D77" />
                      <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                        Consultation Fee
                      </Text>
                    </View>
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      ₹{practice.consultationFee} per visit
                    </Text>
                  </View>
                </Card>
              </MotionView>

              {/* Consultation Modes & Controls */}
              <MotionView delay={180}>
                <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Consultation Modes
                </Text>
                <Card className="p-2 divide-y divide-[#EDF3F4] dark:divide-[#1B3650]">
                  <View className="flex-row items-center justify-between p-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Video size={17} color={colors.teal} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                          Accept Video Consultations
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          Instant 2-minute HD clinical video calls
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={practice.consultationModes.includes('VIDEO')}
                      disabled={savingMode}
                      onValueChange={() => handleToggleMode('VIDEO')}
                      trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between p-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Building2 size={17} color={colors.teal} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                          Accept In-Person Clinic Visits
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          Show clinic visit appointment slots
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={practice.consultationModes.includes('IN_PERSON')}
                      disabled={savingMode}
                      onValueChange={() => handleToggleMode('IN_PERSON')}
                      trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between p-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Fingerprint size={17} color={colors.teal} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                          {biometricLabel} Unlock
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          Quick fingerprint biometric login
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={biometricEnabled}
                      disabled={isUpdatingBio}
                      onValueChange={handleToggleBiometric}
                      trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between p-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-2">
                      <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        {isDark ? <Moon size={17} color="#83C5BE" /> : <Sun size={17} color="#006D77" />}
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">Dark Theme</Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          Low-glare clinical dark mode
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={isDark}
                      onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')}
                      trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                    />
                  </View>
                </Card>
              </MotionView>

              {/* Sign Out Button */}
              <MotionView delay={240}>
                <TouchableOpacity
                  onPress={() => setShowLogoutModal(true)}
                  className="flex-row items-center justify-center gap-2 p-4 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
                  activeOpacity={0.75}
                >
                  <LogOut size={18} color="#E11D48" />
                  <Text className="font-inter-bold text-sm text-rose-600 dark:text-rose-400">
                    Sign Out of Doctor Portal
                  </Text>
                </TouchableOpacity>
              </MotionView>
            </>
          )}
        </View>
      </ScrollView>

      {/* ── MODAL 1: ADJUST CONSULTATION FEE ── */}
      <Modal visible={showFeeModal} animationType="slide" transparent onRequestClose={() => setShowFeeModal(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 max-h-[85%]"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-3 mb-4">
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                  <IndianRupee size={18} color="#006D77" />
                </View>
                <View>
                  <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                    Adjust Consultation Fee
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                    Set your consultation pricing in INR (₹)
                  </Text>
                </View>
              </View>
              <Pressable onPress={() => setShowFeeModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              {/* Active Fee Callout */}
              <View className="p-3.5 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#83C5BE]/40 flex-row items-center justify-between">
                <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">
                  Currently Active Fee:
                </Text>
                <Text className="font-inter-bold text-lg text-[#006D77] dark:text-[#83C5BE]">
                  ₹{practice.consultationFee}
                </Text>
              </View>

              {/* Quick Preset Buttons */}
              <View>
                <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                  Popular Consultation Pricing
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {PRESET_FEES.map((fee) => {
                    const isSelected = feeInput === String(fee);
                    return (
                      <TouchableOpacity
                        key={fee}
                        onPress={() => setFeeInput(String(fee))}
                        activeOpacity={0.7}
                        className={`px-4 py-2 rounded-2xl border ${
                          isSelected
                            ? 'bg-[#006D77] border-[#006D77]'
                            : 'bg-[#F4F7F8] dark:bg-[#06101B] border-[#E6ECEF] dark:border-[#1B3650]'
                        }`}
                      >
                        <Text
                          className={`font-inter-bold text-xs ${
                            isSelected ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                          }`}
                        >
                          ₹{fee}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Custom Number Input */}
              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1.5">
                  Or Enter Custom Amount (₹)
                </Text>
                <View className="flex-row items-center rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] px-3.5 py-2.5">
                  <Text className="font-inter-bold text-base text-[#006D77] dark:text-[#83C5BE] mr-2">₹</Text>
                  <TextInput
                    value={feeInput}
                    onChangeText={setFeeInput}
                    keyboardType="numeric"
                    placeholder="e.g. 500"
                    placeholderTextColor="#94A3B8"
                    className="flex-1 font-inter-bold text-base text-[#0B1F33] dark:text-white p-0"
                  />
                </View>
                <Text className="font-inter text-[11px] text-slate-400 mt-1">
                  Updated immediately for all patients booking video and clinic consultations.
                </Text>
              </View>

              {/* Save Button */}
              <Button
                title={savingFee ? 'Updating Fee...' : `Save Consultation Fee (₹${feeInput || 0})`}
                onPress={handleSaveFee}
                disabled={savingFee}
                className="w-full mt-2"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: EDIT PRACTICE DETAILS ── */}
      <Modal visible={showPracticeModal} animationType="slide" transparent onRequestClose={() => setShowPracticeModal(false)}>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[30px] bg-white dark:bg-[#0B1F33] border-t border-[#E2E9EC] dark:border-[#1B3650] p-6 max-h-[85%]"
          >
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-3 mb-4">
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                  <Edit3 size={18} color="#006D77" />
                </View>
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                  Practice Profile
                </Text>
              </View>
              <Pressable onPress={() => setShowPracticeModal(false)} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1">
                  Clinical Specialization
                </Text>
                <TextInput
                  value={editSpecialization}
                  onChangeText={setEditSpecialization}
                  placeholder="e.g. Cardiology, General Physician"
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 font-inter text-xs text-[#0B1F33] dark:text-white"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1">
                  Practice City / Metro Region
                </Text>
                <TextInput
                  value={editCity}
                  onChangeText={setEditCity}
                  placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 font-inter text-xs text-[#0B1F33] dark:text-white"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1">
                  Experience (Years)
                </Text>
                <TextInput
                  value={editExperience}
                  onChangeText={setEditExperience}
                  keyboardType="numeric"
                  placeholder="e.g. 8"
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 font-inter text-xs text-[#0B1F33] dark:text-white"
                />
              </View>

              <View>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white mb-1">
                  Clinical Bio / Summary
                </Text>
                <TextInput
                  value={editBio}
                  onChangeText={setEditBio}
                  multiline
                  numberOfLines={3}
                  placeholder="Short clinical summary shown to patients on your booking page..."
                  placeholderTextColor="#94A3B8"
                  className="rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] p-3 font-inter text-xs text-[#0B1F33] dark:text-white min-h-[70px]"
                />
              </View>

              <Button
                title={savingPractice ? 'Saving Profile...' : 'Save Practice Details'}
                onPress={handleSavePracticeDetails}
                disabled={savingPractice}
                className="w-full mt-2"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: PROFILE PHOTO & CLINICAL AVATARS ── */}
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
            <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#1B3650] pb-3 mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                  <Camera size={18} color="#006D77" />
                </View>
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                  Doctor Profile Photo
                </Text>
              </View>
              <Pressable
                onPress={() => !isUploadingAvatar && setShowAvatarModal(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
              <View className="items-center py-1">
                <View className="h-22 w-22 rounded-3xl overflow-hidden bg-[#EAF4F5] dark:bg-[#112942] border-2 border-[#006D77] items-center justify-center">
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="#006D77" />
                  ) : avatarUrl ? (
                    <Image
                      source={{ uri: resolveMediaUrl(avatarUrl) || '' }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Stethoscope size={30} color="#006D77" />
                  )}
                </View>
                {avatarUploadMsg && (
                  <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE] mt-2">
                    {avatarUploadMsg}
                  </Text>
                )}
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#006D77]"
                >
                  <Camera size={15} color="#FFFFFF" />
                  <Text className="font-inter-bold text-xs text-white">Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePickFromGallery}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] border border-[#C7E3E5] dark:border-[#1B3650]"
                >
                  <Upload size={15} color={isDark ? '#83C5BE' : '#006D77'} />
                  <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">Gallery</Text>
                </TouchableOpacity>
              </View>

              {/* Preset Avatars */}
              <View className="pt-1">
                <View className="flex-row items-center gap-1.5 mb-2">
                  <Sparkles size={14} color="#006D77" />
                  <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Clinical Preset Avatars
                  </Text>
                </View>
                <View className="flex-row flex-wrap justify-between gap-y-2.5">
                  {PRESET_AVATARS.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.id}
                      onPress={() => handleApplyAvatarDataUrl(avatar.dataUrl)}
                      disabled={isUploadingAvatar}
                      activeOpacity={0.7}
                      style={{ width: '23%' }}
                      className="items-center p-2 rounded-2xl border border-[#E2E9EC] dark:border-[#1B3650] bg-[#F8FAFB] dark:bg-[#06101B]"
                    >
                      <View className="h-11 w-11 rounded-xl overflow-hidden bg-white dark:bg-slate-800 items-center justify-center">
                        <Image source={{ uri: avatar.dataUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      </View>
                      <Text className="font-inter-bold text-[9px] text-[#0B1F33] dark:text-white mt-1 text-center" numberOfLines={1}>
                        {avatar.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {avatarUrl && (
                <TouchableOpacity
                  onPress={handleRemoveAvatar}
                  disabled={isUploadingAvatar}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
                >
                  <Trash2 size={13} color="#E11D48" />
                  <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">
                    Remove Current Photo
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: SIGN OUT CONFIRMATION ── */}
      <Modal visible={showLogoutModal} animationType="fade" transparent onRequestClose={() => setShowLogoutModal(false)}>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <Card className="p-6 space-y-4">
            <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">Sign Out?</Text>
            <Text className="font-inter text-sm text-slate-500 dark:text-slate-400">
              You will be signed out of the Doctor Portal and returned to the sign-in screen.
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
