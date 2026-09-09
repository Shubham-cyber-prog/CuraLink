import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Bell, CalendarCheck, Search, Stethoscope, Bot, FileText, ChevronRight, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UpcomingAppointmentCard } from '../../components/appointments/UpcomingAppointmentCard';
import { DoctorRecommendationCard } from '../../components/home/DoctorRecommendationCard';
import { QuickActionCard } from '../../components/home/QuickActionCard';
import { useAuth } from '../../lib/auth-context';
import type { AppointmentPreview, DoctorPreview } from '../../types/healthcare';

const upcomingAppointment: AppointmentPreview = {
  id: 'appt_101',
  doctorName: 'Dr. Sarah Jenkins',
  specialty: 'Cardiology Specialist',
  dateLabel: 'Today, October 24',
  timeLabel: '10:00 AM · Video visit',
  status: 'confirmed',
};

const recommendedDoctors: DoctorPreview[] = [
  {
    id: 'doc_1',
    name: 'Dr. Priya Sharma',
    specialty: 'General Practice',
    rating: 4.9,
    reviewCount: 124,
    nextAvailableLabel: 'Today',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=560&q=80',
  },
  {
    id: 'doc_3',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Dermatology',
    rating: 4.95,
    reviewCount: 210,
    nextAvailableLabel: 'Today',
    photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce7890b?auto=format&fit=crop&w=560&q=80',
  },
  {
    id: 'doc_2',
    name: 'Dr. Marcus Vance',
    specialty: 'Cardiologist',
    rating: 4.8,
    reviewCount: 98,
    nextAvailableLabel: 'Tomorrow',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=560&q=80',
  },
];

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
  if (hour < 12) return 'Good morning 👋';
  if (hour < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

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
          <UpcomingAppointmentCard
            appointment={upcomingAppointment}
            onPress={() => router.push(`/consultation/${upcomingAppointment.id}` as any)}
          />
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

        <ScrollView horizontal contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }} showsHorizontalScrollIndicator={false}>
          {recommendedDoctors.map((doctor) => (
            <DoctorRecommendationCard key={doctor.id} doctor={doctor} onPress={() => router.push('/doctor-booking')} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
