import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator, Image } from 'react-native';
import { Bell, CalendarCheck, Search, Stethoscope, Bot, FileText, ChevronRight, Shield, Sparkles, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UpcomingAppointmentCard } from '../../components/appointments/UpcomingAppointmentCard';
import { DoctorRecommendationCard } from '../../components/home/DoctorRecommendationCard';
import { QuickActionCard } from '../../components/home/QuickActionCard';
import { Card } from '../../components/UI';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import type { AppointmentPreview, DoctorPreview } from '../../types/healthcare';

function HomeSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#0B1120]" edges={['top']}>
      <View className="px-5 pt-3 space-y-3">
        {/* Brand bar skeleton */}
        <View className="flex-row items-center justify-between pb-2">
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
            <View className="space-y-1">
              <View className="h-4 w-24 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
              <View className="h-3 w-16 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
            <View className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
          </View>
        </View>
        {/* Greeting skeleton */}
        <View className="space-y-1 py-1">
          <View className="h-3 w-20 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
          <View className="h-7 w-48 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
        </View>
        {/* Search bar skeleton */}
        <View className="h-12 w-full rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
        {/* Banner skeleton */}
        <View className="h-24 w-full rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
      </View>
    </SafeAreaView>
  );
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const [upcomingAppointment, setUpcomingAppointment] = useState<AppointmentPreview | null>(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState<DoctorPreview[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        // 1. Fetch upcoming appointments
        const apptsRes = await api.get<any[]>('/appointments/my-appointments').catch(() => null);
        if (apptsRes?.data && Array.isArray(apptsRes.data)) {
          const upcoming = apptsRes.data.find(
            (a: any) => a.status === 'CONFIRMED' || a.status === 'PENDING'
          );
          if (upcoming) {
            setUpcomingAppointment({
              id: upcoming.id,
              doctorName: upcoming.doctor?.name || 'Dr. Medical Specialist',
              specialty: upcoming.doctor?.specialty || upcoming.doctor?.specialization || 'General Practice',
              dateLabel: upcoming.date ? new Date(upcoming.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
              timeLabel: `${upcoming.time || '10:00 AM'} · Video visit`,
              status: upcoming.status === 'CONFIRMED' ? 'confirmed' : 'pending',
            });
          } else {
            setUpcomingAppointment(null);
          }
        }

        // 2. Fetch recommended verified doctors
        const docsRes = await api.get<any[]>('/doctors/verified').catch(() => null);
        if (docsRes?.data && Array.isArray(docsRes.data)) {
          const mappedDocs: DoctorPreview[] = docsRes.data.map((d: any) => ({
            id: d.id || d.userId,
            name: d.name || 'Dr. Specialist',
            specialty: d.specialization || d.specialty || 'General Practice',
            rating: typeof d.rating === 'number' ? d.rating : 4.9,
            reviewCount: typeof d.reviewCount === 'number' ? d.reviewCount : 15,
            nextAvailableLabel: d.nextAvailableDate || 'Today',
            photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=560&q=80',
          }));
          setRecommendedDoctors(mappedDocs);
        }
      } catch (err) {
        console.error('Failed to load home screen data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadHomeData();
  }, []);

  if (isLoading) return <HomeSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-[#0B1120]" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* ── 1. BRAND TOP BAR ── */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
          {/* Brand Logo & Telehealth Status */}
          <View className="flex-row items-center gap-2.5">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200/90 dark:border-[#263049] shadow-xs">
              <Image
                source={require('../../../assets/images/logo.png')}
                style={{ width: 26, height: 26 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="font-inter-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Cura<Text className="text-[#0D9488] dark:text-[#14B8A6]">Link</Text>
                </Text>
                <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5">
                  <View className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <Text className="font-inter-medium text-[10px] text-emerald-700 dark:text-emerald-300">
                    Live Care
                  </Text>
                </View>
              </View>
              <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                Verified Telehealth Network
              </Text>
            </View>
          </View>

          {/* Quick Actions: Notifications & Profile Avatar */}
          <View className="flex-row items-center gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200/90 dark:border-[#263049] shadow-xs active:bg-slate-50 dark:active:bg-[#1C2338]"
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Bell color="#0D9488" size={18} />
              <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-white dark:border-[#151B2E] bg-teal-500" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Profile"
              className="h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 shadow-xs active:scale-95"
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text className="font-inter-bold text-sm text-[#0D9488] dark:text-[#14B8A6]">
                {(user?.name || 'P')[0]?.toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── 2. PERSONALIZED GREETING & STATUS BANNER ── */}
        <View className="px-5 pt-3 pb-3">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <View className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
            <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              {greetingForNow()}
            </Text>
          </View>
          <Text className="font-inter-bold text-2xl text-slate-900 dark:text-white tracking-tight">
            {user?.name ? user.name : 'Welcome, Patient'}
          </Text>
          <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your clinical consultations and medical vault are ready.
          </Text>
        </View>

        {/* ── 3. FLOATING INTERACTIVE SEARCH BAR ── */}
        <View className="px-5 mb-4">
          <Pressable
            onPress={() => router.push('/(tabs)/doctors')}
            className="flex-row items-center justify-between rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-200/90 dark:border-[#263049] px-4 py-3 shadow-xs active:border-[#0D9488]"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="h-7 w-7 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60">
                <Search size={15} color="#0D9488" />
              </View>
              <View className="flex-1">
                <Text className="font-inter text-xs text-slate-400 dark:text-slate-500">
                  Search specialists, symptoms, conditions...
                </Text>
              </View>
            </View>
            <View className="rounded-lg bg-slate-100 dark:bg-[#1C2338] px-2.5 py-1">
              <Text className="font-inter-medium text-[11px] text-slate-600 dark:text-slate-400">
                Browse
              </Text>
            </View>
          </Pressable>
        </View>

        {/* ── 4. QUICK SPECIALTIES CHIP ROW ── */}
        <View className="mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 20, paddingRight: 8, gap: 8 }}
          >
            {[
              { label: 'All Doctors', icon: '🩺' },
              { label: 'General Physician', icon: '👨‍⚕️' },
              { label: 'Cardiology', icon: '🫀' },
              { label: 'Dermatology', icon: '🌿' },
              { label: 'Pediatrics', icon: '👶' },
              { label: 'Neurology', icon: '🧠' },
            ].map((chip) => (
              <Pressable
                key={chip.label}
                onPress={() => router.push('/(tabs)/doctors')}
                className="flex-row items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-[#263049] bg-white dark:bg-[#151B2E] px-3 py-2 shadow-2xs active:bg-teal-50 dark:active:bg-teal-950/50"
              >
                <Text className="text-xs">{chip.icon}</Text>
                <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">
                  {chip.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ── 5. ELEVATED CLINICAL AI INTAKE HERO BANNER ── */}
        <View className="px-5 mb-6">
          <Pressable
            onPress={() => router.push('/(tabs)/symptom-checker')}
            className="overflow-hidden rounded-2xl bg-[#085041] dark:bg-[#064235] p-4 shadow-sm border border-teal-700/50 active:opacity-95"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5">
                <Sparkles size={11} color="#5EEAD4" />
                <Text className="font-inter-semibold text-[10px] tracking-wide text-teal-200 uppercase">
                  Clinical AI Triage
                </Text>
              </View>
              <View className="h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <ChevronRight size={14} color="#FFFFFF" />
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/15">
                <Bot color="#5EEAD4" size={22} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-sm text-white">
                  Feeling unwell? Start Assessment
                </Text>
                <Text className="font-inter text-xs text-teal-100/90 mt-0.5">
                  Instant clinical evaluation & matched doctor booking
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* Next Visit Section */}
        <View className="px-5 mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-inter-bold text-base text-charcoal dark:text-[#F1F5F9]">Your next visit</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/appointments')}>
              <Text className="font-inter-semibold text-xs text-teal-700 dark:text-teal-400">See all</Text>
            </Pressable>
          </View>
          {upcomingAppointment ? (
            <UpcomingAppointmentCard
              appointment={upcomingAppointment}
              onPress={() => router.push(`/consultation/${upcomingAppointment.id}` as any)}
            />
          ) : (
            <Card className="p-5 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151B2E]">
              <CalendarCheck size={28} color="#0D9488" />
              <Text className="font-inter-medium text-xs text-charcoal dark:text-slate-200 mt-2">No upcoming visits scheduled</Text>
              <Pressable
                onPress={() => router.push('/doctor-booking')}
                className="mt-3 bg-teal-50 dark:bg-teal-950/60 px-4 py-2 rounded-xl border border-teal-200 dark:border-teal-800"
              >
                <Text className="font-inter-semibold text-xs text-teal-700 dark:text-teal-300">Schedule Consultation</Text>
              </Pressable>
            </Card>
          )}
        </View>

        {/* Quick Actions Grid */}
        <View className="px-5 mb-6">
          <Text className="mb-3 font-inter-bold text-base text-charcoal dark:text-[#F1F5F9]">Quick services</Text>
          <View className="flex-row gap-3 mb-3">
            <QuickActionCard
              icon={Search}
              iconColor="#2563EB"
              iconBackgroundClassName="bg-blue-50 dark:bg-blue-950/40"
              title="Find Specialist"
              subtitle="Browse top doctors"
              onPress={() => router.push('/(tabs)/doctors')}
            />
            <QuickActionCard
              icon={CalendarCheck}
              iconColor="#0D9488"
              iconBackgroundClassName="bg-teal-50 dark:bg-teal-950/40"
              title="Appointments"
              subtitle="Schedule & history"
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>
        </View>

        {/* Recommended Doctors Carousel */}
        <View className="px-5 mb-3 flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-base text-charcoal dark:text-[#F1F5F9]">Recommended doctors</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">Book with top-rated specialists</Text>
          </View>
          <Stethoscope color="#0D9488" size={20} />
        </View>

        {loadingData ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#0D9488" />
          </View>
        ) : recommendedDoctors.length === 0 ? (
          <View className="px-5">
            <Card className="p-4 items-center justify-center border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151B2E]">
              <Text className="font-inter text-xs text-muted dark:text-slate-400">No recommended doctors currently available</Text>
            </Card>
          </View>
        ) : (
          <ScrollView horizontal contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }} showsHorizontalScrollIndicator={false}>
            {recommendedDoctors.map((doctor) => (
              <DoctorRecommendationCard
                key={doctor.id}
                doctor={doctor}
                onPress={() =>
                  router.push({
                    pathname: '/doctor-booking',
                    params: {
                      doctorId: doctor.id,
                      name: doctor.name,
                      specialty: doctor.specialty,
                    },
                  })
                }
              />
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
