import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Bell, CalendarCheck, Search, Stethoscope } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UpcomingAppointmentCard } from '../../components/appointments/UpcomingAppointmentCard';
import { DoctorRecommendationCard } from '../../components/home/DoctorRecommendationCard';
import { QuickActionCard } from '../../components/home/QuickActionCard';
import { useAuth } from '../../lib/auth-context';
import type { AppointmentPreview, DoctorPreview } from '../../types/healthcare';

const upcomingAppointment: AppointmentPreview = {
  id: 'appointment-1',
  doctorName: 'Dr. Sarah Jenkins',
  specialty: 'Cardiology',
  dateLabel: 'Thursday, October 24',
  timeLabel: '10:00 AM · Video visit',
  status: 'confirmed',
};

const recommendedDoctors: DoctorPreview[] = [
  {
    id: 'sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Cardiologist',
    rating: 4.9,
    reviewCount: 128,
    nextAvailableLabel: 'Today',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=560&q=80',
  },
  {
    id: 'michael-chen',
    name: 'Dr. Michael Chen',
    specialty: 'General Practitioner',
    rating: 4.8,
    reviewCount: 342,
    nextAvailableLabel: 'Tomorrow',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=560&q=80',
  },
];

function HomeSkeleton() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-5 pt-5">
        <View className="h-4 w-24 rounded-full bg-slate-200" />
        <View className="mt-3 h-8 w-44 rounded-full bg-slate-200" />
        <View className="mt-7 h-48 rounded-2xl bg-slate-200" />
        <View className="mt-7 h-5 w-28 rounded-full bg-slate-200" />
        <View className="mt-4 flex-row gap-4">
          <View className="h-36 flex-1 rounded-2xl bg-slate-200" />
          <View className="h-36 flex-1 rounded-2xl bg-slate-200" />
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

  if (isLoading) return <HomeSkeleton />;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between px-5 pb-7 pt-5">
          <View>
            <Text className="font-inter text-sm text-muted">{greetingForNow()}</Text>
            <Text className="mt-1 font-inter-bold text-[28px] text-charcoal">{user?.name ?? 'Patient'}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            className="h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm shadow-slate-200"
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Bell color="#0D9488" size={21} />
            <View className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500" />
          </Pressable>
        </View>

        <View className="px-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-lg text-charcoal">Your next visit</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/appointments')}>
              <Text className="font-inter-semibold text-sm text-teal-700">See all</Text>
            </Pressable>
          </View>
          <UpcomingAppointmentCard appointment={upcomingAppointment} onPress={() => router.push('/(tabs)/appointments')} />

          <Text className="mb-4 mt-8 font-inter-semibold text-lg text-charcoal">Quick actions</Text>
          <View className="flex-row gap-4">
            <QuickActionCard
              icon={Search}
              iconColor="#2563EB"
              iconBackgroundClassName="bg-blue-50"
              title="Find a doctor"
              subtitle="Browse trusted specialists"
              onPress={() => router.push('/(tabs)/doctors')}
            />
            <QuickActionCard
              icon={CalendarCheck}
              iconColor="#0D9488"
              iconBackgroundClassName="bg-teal-50"
              title="Appointments"
              subtitle="Manage your care visits"
              onPress={() => router.push('/(tabs)/appointments')}
            />
          </View>

          <View className="mb-4 mt-8 flex-row items-center justify-between">
            <View>
              <Text className="font-inter-semibold text-lg text-charcoal">Recommended for you</Text>
              <Text className="mt-1 font-inter text-sm text-muted">Book with top-rated specialists</Text>
            </View>
            <Stethoscope color="#0D9488" size={20} />
          </View>
        </View>

        <ScrollView horizontal contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }} showsHorizontalScrollIndicator={false}>
          {recommendedDoctors.map((doctor) => (
            <DoctorRecommendationCard key={doctor.id} doctor={doctor} onPress={() => router.push('/(tabs)/doctors')} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
