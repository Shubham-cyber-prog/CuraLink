import React, { useState, useEffect, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  CalendarCheck,
  Search,
  Stethoscope,
  Bot,
  ChevronRight,
  ShieldCheck,
  Video,
  MessageCircle,
  Clock,
  Star,
  MapPin,
  ArrowRight,
  CreditCard,
  ChevronDown,
  Navigation,
  Sparkles,
  Heart,
  Baby,
  Activity,
  Smile,
  Shield,
  PhoneCall,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { MotionView, MotionPressable } from '../../components/Motion';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { CuraLinkLogo } from '../../components/CuraLinkLogo';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { useLocation } from '../../lib/location-context';
import { api } from '../../lib/api';
import { resolveMediaUrl } from '../../lib/api-config';

interface HomeAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  dateLabel: string;
  timeLabel: string;
  status: 'CONFIRMED' | 'PENDING';
  fee: number;
}

interface HomeDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  city: string;
  fee: number;
  experience: string;
}

const SPECIALTY_TILES = [
  { name: 'General Medicine', desc: 'Fever, cough & cold', price: '₹199', icon: Stethoscope, color: '#006D77' },
  { name: 'Pediatrics', desc: 'Child health & vaccines', price: '₹349', icon: Baby, color: '#0891B2' },
  { name: 'Cardiology', desc: 'Heart care & BP', price: '₹499', icon: Heart, color: '#E11D48' },
  { name: 'Dermatology', desc: 'Skin, acne & hair', price: '₹299', icon: Sparkles, color: '#D97706' },
  { name: 'Endocrinology', desc: 'Diabetes & thyroid', price: '₹299', icon: Activity, color: '#7C3AED' },
  { name: 'Mental Health', desc: 'Stress, therapy & sleep', price: '₹499', icon: Smile, color: '#059669' },
];

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatReadableDate(raw?: string): string {
  if (!raw) return 'Today';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isLoading, user } = useAuth();
  const { isDark } = useTheme();
  const { location } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [upcomingAppointment, setUpcomingAppointment] = useState<HomeAppointment | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<HomeDoctor[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHomeData = useCallback(async () => {
    try {
      const [apptsRes, docsRes] = await Promise.all([
        api.get<any[]>('/appointments/my-appointments').catch(() => null),
        api.get<any[]>('/doctors').catch(() => null),
      ]);

      if (apptsRes?.data && Array.isArray(apptsRes.data)) {
        const upcoming = apptsRes.data.find((a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING');
        if (upcoming) {
          const docName = upcoming.doctor?.name || upcoming.doctorName || 'Dr. Specialist';
          setUpcomingAppointment({
            id: upcoming.id,
            doctorName: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
            specialty: upcoming.doctor?.specialty || upcoming.doctor?.specialization || 'General Practice',
            dateLabel: formatReadableDate(upcoming.date || upcoming.scheduledAt),
            timeLabel: upcoming.time || '10:30 AM',
            status: upcoming.status === 'CONFIRMED' ? 'CONFIRMED' : 'PENDING',
            fee: upcoming.payment?.amount || upcoming.doctor?.consultationFee || 500,
          });
        } else {
          setUpcomingAppointment(null);
        }
      }

      if (docsRes?.data && Array.isArray(docsRes.data)) {
        const mappedDocs: HomeDoctor[] = docsRes.data.slice(0, 6).map((d: any) => {
          const rawName = d.name || 'Specialist';
          return {
            id: d.id || d.userId,
            name: rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`,
            specialty: d.specialization || d.specialty || 'General Practice',
            rating: typeof d.rating === 'number' && d.rating > 0 ? d.rating : 4.9,
            reviewCount: typeof d.reviewCount === 'number' ? d.reviewCount : 0,
            city: d.city || 'Online Video',
            fee: d.consultationFee || 500,
            experience: d.experience || `${d.experienceYears || 5}+ yrs`,
          };
        });
        setRecommendedDoctors(mappedDocs);
      }
    } catch (err) {
      console.error('Failed to load home screen data:', err);
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F6F8F9] dark:bg-[#071320]">
        <ActivityIndicator size="large" color="#006D77" />
      </View>
    );
  }

  const firstName = (user?.name || 'Patient').split(' ')[0];

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 100, 115) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadHomeData();
            }}
            colors={['#006D77']}
          />
        }
      >
        {/* ── 1. PREMIUM BRAND HEADER (Website Matched) ── */}
        <View
          style={{ paddingTop: Math.max(insets.top + 8, 18) }}
          className="bg-white dark:bg-[#0B1F33] px-5 pb-5 border-b border-[#E6ECEF] dark:border-[#163656]"
        >
          {/* Top Row: Real Logo & Profile Avatar */}
          <View className="flex-row items-center justify-between mb-3.5">
            <CuraLinkLogo size="md" showSubtitle subtitle="India's #1 Telehealth" />

            <MotionPressable
              onPress={() => router.push('/(tabs)/profile')}
              className="h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44] border border-[#C7E3E5] dark:border-[#163656] overflow-hidden"
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: resolveMediaUrl(user.avatarUrl) || '' }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                  {(user?.name || 'P')[0]?.toUpperCase()}
                </Text>
              )}
            </MotionPressable>
          </View>

          {/* GPS Location Bar (Swiggy / Zomato Style) */}
          <TouchableOpacity
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.8}
            className="flex-row items-center justify-between rounded-2xl bg-[#F6F8F9] dark:bg-[#071320] border border-[#E2E8F0] dark:border-[#163656] px-3.5 py-2.5 mb-3.5"
          >
            <View className="flex-row items-center gap-2.5 flex-1 pr-2">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-[#006D77]">
                {location.source === 'gps' ? (
                  <Navigation size={14} color="#FFFFFF" />
                ) : (
                  <MapPin size={14} color="#FFFFFF" />
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white" numberOfLines={1}>
                    {location.area}
                  </Text>
                  <ChevronDown size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                </View>
                <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400" numberOfLines={1}>
                  {location.fullAddress}
                </Text>
              </View>
            </View>

            <View className="rounded-full bg-[#EAF4F5] dark:bg-[#112A44] px-2.5 py-1">
              <Text className="font-inter-bold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                {location.isAllIndia ? 'All India' : 'Change'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Greeting */}
          <View className="flex-row items-baseline justify-between mb-3">
            <View>
              <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">
                {greetingForNow()},
              </Text>
              <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white tracking-tight">
                {firstName} 👋
              </Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1">
              <View className="h-2 w-2 rounded-full bg-emerald-500" />
              <Text className="font-inter-semibold text-[10px] text-emerald-700 dark:text-emerald-300">
                24×7 Doctors Online
              </Text>
            </View>
          </View>

          {/* Search Bar Trigger */}
          <MotionPressable
            onPress={() => router.push('/(tabs)/doctors')}
            className="flex-row items-center justify-between rounded-2xl bg-[#F6F8F9] dark:bg-[#071320] border border-[#E2E8F0] dark:border-[#163656] px-4 py-3"
          >
            <View className="flex-row items-center gap-2.5 flex-1">
              <Search size={17} color="#006D77" />
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                Search doctor name, specialty, or condition...
              </Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" />
          </MotionPressable>
        </View>

        {/* ── 2. EDITORIAL HERO CARD (Matching Website) ── */}
        <MotionView delay={60} className="px-5 mt-4 mb-4">
          <View className="rounded-3xl bg-[#006D77] p-5 shadow-sm overflow-hidden relative">
            {/* Background Accent Glow */}
            <View className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-[#83C5BE]/20" />

            <View className="flex-row items-center gap-2 mb-2">
              <View className="rounded-full bg-white/20 px-2.5 py-0.5">
                <Text className="font-inter-bold text-[10px] text-white">⚡ CONNECT IN 2 MINS</Text>
              </View>
              <Text className="font-inter text-xs text-[#83C5BE]">Starting at ₹199</Text>
            </View>

            <Text className="font-inter-bold text-xl text-white leading-tight mb-1.5">
              Consult Top Board-Certified Doctors
            </Text>
            <Text className="font-inter text-xs text-white/80 leading-relaxed mb-4">
              Instant HD video call, digitally-signed prescriptions &amp; free medical record vault.
            </Text>

            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/doctors')}
                activeOpacity={0.85}
                className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm"
              >
                <Text className="font-inter-bold text-xs text-[#006D77]">Consult Now</Text>
                <ArrowRight size={14} color="#006D77" />
              </TouchableOpacity>

              <View className="flex-row items-center gap-1.5">
                <ShieldCheck size={14} color="#83C5BE" />
                <Text className="font-inter text-[11px] text-white/90">100% NMC Verified</Text>
              </View>
            </View>
          </View>
        </MotionView>

        {/* ── 3. CORE SERVICES (4 Quick Action Tiles) ── */}
        <MotionView delay={100} className="px-5 mb-3">
          <View className="flex-row flex-wrap gap-2.5">
            {[
              {
                title: 'Video Consult',
                subtitle: 'From ₹199 • 2 min',
                icon: Video,
                onPress: () => router.push('/(tabs)/doctors'),
                bg: '#EAF4F5',
                darkBg: '#112A44',
                color: '#006D77',
              },
              {
                title: 'Lab at Home',
                subtitle: 'Free sample pickup',
                icon: Activity,
                onPress: () => router.push('/lab-tests'),
                bg: '#ECFDF5',
                darkBg: '#064E3B',
                color: '#059669',
              },
              {
                title: 'AI Health Check',
                subtitle: '60s instant triage',
                icon: Bot,
                onPress: () => router.push('/(tabs)/symptom-checker'),
                bg: '#EDE9FE',
                darkBg: '#2E1065',
                color: '#7C3AED',
              },
              {
                title: 'My Visits & Pay',
                subtitle: 'Manage schedule',
                icon: CalendarCheck,
                onPress: () => router.push('/(tabs)/appointments'),
                bg: '#FEF3C7',
                darkBg: '#78350F',
                color: '#D97706',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <View key={item.title} style={{ width: '48.5%' }}>
                  <MotionPressable
                    onPress={item.onPress}
                    className="rounded-2xl border border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33] p-3.5"
                  >
                    <View
                      style={{ backgroundColor: isDark ? item.darkBg : item.bg }}
                      className="h-10 w-10 items-center justify-center rounded-xl mb-2"
                    >
                      <Icon size={19} color={isDark ? '#83C5BE' : item.color} />
                    </View>
                    <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                      {item.title}
                    </Text>
                    <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.subtitle}
                    </Text>
                  </MotionPressable>
                </View>
              );
            })}
          </View>
        </MotionView>

        {/* ── 3.5 LAB TESTS AT HOME PROMO STRIP ── */}
        <MotionView delay={120} className="px-5 mb-5">
          <MotionPressable
            onPress={() => router.push('/lab-tests')}
            className="rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/70 dark:bg-[#072428] p-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5 flex-1 pr-2">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#006D77]">
                <Activity size={17} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                    Diagnostics &amp; Blood Tests at Home
                  </Text>
                  <View className="rounded-full bg-[#006D77] px-1.5 py-0.2">
                    <Text className="font-inter-bold text-[9px] text-white">NABL</Text>
                  </View>
                </View>
                <Text className="font-inter text-[11px] text-teal-800 dark:text-teal-300">
                  Full body checkup @ ₹999 • Free sample collection
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color="#006D77" />
          </MotionPressable>
        </MotionView>

        {/* ── 4. NEXT CONSULTATION CARD (Active Appointment) ── */}
        <MotionView delay={140} className="px-5 mb-6">
          <View className="mb-2.5 flex-row items-center justify-between">
            <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
              Your Next Consultation
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/appointments')}>
              <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                View All
              </Text>
            </Pressable>
          </View>

          {upcomingAppointment ? (
            <Card className="p-4 space-y-3.5 border border-[#E2E8F0] dark:border-[#163656]">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#006D77]">
                    <Stethoscope size={22} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                      {upcomingAppointment.doctorName}
                    </Text>
                    <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE]">
                      {upcomingAppointment.specialty}
                    </Text>
                  </View>
                </View>
                <Badge
                  label={upcomingAppointment.status === 'CONFIRMED' ? 'Confirmed' : 'Payment Pending'}
                  variant={upcomingAppointment.status === 'CONFIRMED' ? 'success' : 'warning'}
                />
              </View>

              <View className="flex-row items-center justify-between rounded-xl bg-[#F6F8F9] dark:bg-[#071320] px-3.5 py-2.5">
                <View className="flex-row items-center gap-2">
                  <Clock size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                  <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">
                    {upcomingAppointment.dateLabel} • {upcomingAppointment.timeLabel}
                  </Text>
                </View>
                <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                  ₹{upcomingAppointment.fee}
                </Text>
              </View>

              {upcomingAppointment.status === 'CONFIRMED' ? (
                <View className="flex-row gap-2.5">
                  <View className="flex-1">
                    <MotionPressable
                      onPress={() => router.push(`/consultation/${upcomingAppointment.id}` as any)}
                      className="flex-row items-center justify-center gap-2 rounded-full bg-[#006D77] py-3 shadow-sm"
                    >
                      <Video size={16} color="#FFFFFF" />
                      <Text className="font-inter-semibold text-xs text-white">Join HD Video Call</Text>
                    </MotionPressable>
                  </View>
                  <MotionPressable
                    onPress={() =>
                      router.push({
                        pathname: '/chat',
                        params: {
                          appointmentId: upcomingAppointment.id,
                          doctorName: upcomingAppointment.doctorName,
                        },
                      })
                    }
                    className="h-11 w-11 items-center justify-center rounded-full border border-[#E2E8F0] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#112A44]"
                  >
                    <MessageCircle size={18} color={isDark ? '#83C5BE' : '#006D77'} />
                  </MotionPressable>
                </View>
              ) : (
                <MotionPressable
                  onPress={() => router.push('/(tabs)/appointments')}
                  className="flex-row items-center justify-center gap-2 rounded-full bg-[#006D77] py-3 shadow-sm"
                >
                  <CreditCard size={16} color="#FFFFFF" />
                  <Text className="font-inter-semibold text-xs text-white">
                    Pay ₹{upcomingAppointment.fee} &amp; Confirm Slot
                  </Text>
                </MotionPressable>
              )}
            </Card>
          ) : (
            <Card className="p-5 items-center justify-center border-dashed border-[#CBD5E1] dark:border-[#163656]">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44] mb-2">
                <CalendarCheck size={22} color={isDark ? '#83C5BE' : '#006D77'} />
              </View>
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                No active consultations scheduled
              </Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center mt-1 mb-3.5">
                Book a verified doctor for instant video or in-person clinic care.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/doctors')}
                className="flex-row items-center gap-1.5 rounded-full bg-[#006D77] px-4 py-2"
              >
                <Text className="font-inter-semibold text-xs text-white">Find a Doctor</Text>
                <ArrowRight size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </Card>
          )}
        </MotionView>

        {/* ── 5. CLINICAL SPECIALTIES CAROUSEL ── */}
        <MotionView delay={170} className="mb-6">
          <View className="px-5 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                Clinical Specialties
              </Text>
              <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                Transparent consultation fees
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/doctors')}>
              <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                All Specialties →
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {SPECIALTY_TILES.map((spec) => {
              const Icon = spec.icon;
              return (
                <TouchableOpacity
                  key={spec.name}
                  onPress={() =>
                    router.push({
                      pathname: '/(tabs)/doctors',
                      params: { specialty: spec.name },
                    } as any)
                  }
                  activeOpacity={0.8}
                  className="w-36 rounded-2xl border border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33] p-3.5 justify-between"
                >
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EAF4F5] dark:bg-[#112A44] mb-2">
                    <Icon size={18} color={isDark ? '#83C5BE' : spec.color} />
                  </View>
                  <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white" numberOfLines={1}>
                    {spec.name}
                  </Text>
                  <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400 mb-2" numberOfLines={1}>
                    {spec.desc}
                  </Text>
                  <View className="flex-row items-center justify-between pt-1 border-t border-[#EDF3F4] dark:border-[#163656]">
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      {spec.price}
                    </Text>
                    <Text className="font-inter text-[10px] text-slate-400">&lt; 2 min</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </MotionView>

        {/* ── 6. VERIFIED SPECIALISTS CAROUSEL ── */}
        <MotionView delay={210} className="mb-4">
          <View className="px-5 mb-3 flex-row items-center justify-between">
            <View>
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                Verified Specialists
              </Text>
              <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                AIIMS, Apollo &amp; Fortis credentialed
              </Text>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/doctors')} className="flex-row items-center gap-0.5">
              <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">See all</Text>
              <ChevronRight size={14} color={isDark ? '#83C5BE' : '#006D77'} />
            </Pressable>
          </View>

          {loadingData ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="small" color="#006D77" />
            </View>
          ) : recommendedDoctors.length === 0 ? (
            <View className="px-5">
              <Card className="p-4 items-center border border-[#E2E8F0] dark:border-[#163656]">
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  Pull down to refresh verified doctors
                </Text>
              </Card>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            >
              {recommendedDoctors.map((doc) => {
                const initial = doc.name.replace(/^Dr\.?\s*/i, '').charAt(0).toUpperCase();
                return (
                  <MotionPressable
                    key={doc.id}
                    onPress={() =>
                      router.push({
                        pathname: '/doctor-booking',
                        params: {
                          doctorId: doc.id,
                          name: doc.name,
                          specialty: doc.specialty,
                          fee: String(doc.fee),
                          rating: String(doc.rating),
                          reviewCount: String(doc.reviewCount),
                        },
                      })
                    }
                    className="w-64 rounded-2xl border border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33] p-4"
                  >
                    <View className="flex-row items-center gap-3 mb-3">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#006D77]">
                        <Text className="font-inter-bold text-lg text-white">{initial}</Text>
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center gap-1">
                          <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white" numberOfLines={1}>
                            {doc.name}
                          </Text>
                          <ShieldCheck size={13} color="#006D77" />
                        </View>
                        <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE]" numberOfLines={1}>
                          {doc.specialty}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center gap-1">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                          {doc.rating.toFixed(1)}
                        </Text>
                        <Text className="font-inter text-[11px] text-slate-400">• {doc.experience}</Text>
                      </View>
                      <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                        ₹{doc.fee}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between pt-2.5 border-t border-[#EDF3F4] dark:border-[#163656]">
                      <View className="flex-row items-center gap-1">
                        <MapPin size={11} color="#64748B" />
                        <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400" numberOfLines={1}>
                          {doc.city}
                        </Text>
                      </View>
                      <View className="rounded-full bg-[#EAF4F5] dark:bg-[#112A44] px-2.5 py-1">
                        <Text className="font-inter-bold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                          Book &amp; Pay →
                        </Text>
                      </View>
                    </View>
                  </MotionPressable>
                );
              })}
            </ScrollView>
          )}
        </MotionView>
      </ScrollView>

      <LocationPickerModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </View>
  );
}
