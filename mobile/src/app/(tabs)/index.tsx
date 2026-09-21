import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { Bell, CalendarCheck, Search, Stethoscope, Bot, FileText, ChevronRight, Shield } from 'lucide-react-native';
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
      <View className="px-5 pt-5 space-y-4">
        <View className="h-4 w-24 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
        <View className="h-8 w-44 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
        <View className="h-48 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
        <View className="h-5 w-28 rounded-full bg-slate-200 dark:bg-[#1C2338]" />
        <View className="flex-row gap-4">
          <View className="h-36 flex-1 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
          <View className="h-36 flex-1 rounded-2xl bg-slate-200 dark:bg-[#1C2338]" />
        </View>
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
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-5 pt-4">
          <View>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">{greetingForNow()}</Text>
            <Text className="mt-1 font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">{user?.name ?? 'Patient'}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            className="h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-[#151B2E] shadow-sm shadow-slate-200 dark:shadow-none border border-slate-100 dark:border-[#263049]"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Bell color="#0D9488" size={20} />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-white dark:border-[#151B2E] bg-teal-500" />
          </Pressable>
        </View>

        {/* AI Symptom Banner CTA */}
        <View className="px-5 mb-6">
          <Pressable
            onPress={() => router.push('/(tabs)/symptom-checker')}
            className="flex-row items-center justify-between rounded-2xl bg-[#0F9D8C] dark:bg-teal-700 p-4 shadow-lg shadow-[#0F9D8C]/20 dark:shadow-none"
          >
            <View className="flex-row items-center gap-3 flex-1">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <Bot color="#FFFFFF" size={22} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-bold text-sm text-white">Feeling unwell? Check with AI</Text>
                <Text className="font-inter text-xs text-teal-100">Get instant symptom triage & recommendations</Text>
              </View>
            </View>
            <ChevronRight color="#FFFFFF" size={20} />
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
