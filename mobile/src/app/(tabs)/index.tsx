import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Stethoscope, Activity, CalendarPlus, HeartPulse, Sparkles, ChevronRight } from 'lucide-react-native';
import { Card } from '../../components/UI';
import { useAuth } from '../../lib/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns a time-of-day greeting string.
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-slate-50" 
      contentContainerStyle={{ 
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: 40
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Area */}
      <View className="px-5 pb-6 pt-4 flex-row items-center justify-between">
        <View>
          <Text className="font-inter text-sm text-muted">{getGreeting()},</Text>
          <Text className="font-inter-bold text-2xl text-charcoal">
            {user?.name || 'Patient'}
          </Text>
        </View>

        <Pressable 
          onPress={() => router.push('/(tabs)/profile')}
          className="h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm active:bg-slate-50"
        >
          <HeartPulse size={22} color="#0d9488" />
        </Pressable>
      </View>

      <View className="px-5 space-y-6">
        
        {/* Banner Section */}
        <View className="rounded-2xl bg-mint-bg p-5 border border-teal-100">
          <View className="mb-2 flex-row items-center gap-2">
            <Sparkles size={18} color="#0891B2" />
            <Text className="font-inter-semibold text-sm text-teal-800">CuraLink Guidance</Text>
          </View>
          <Text className="font-inter text-sm leading-relaxed text-charcoal">
            Stay hydrated! Drinking 8 glasses of water daily helps maintain energy levels and supports overall clinical health.
          </Text>
        </View>

        {/* Quick Actions */}
        <View>
          <Text className="mb-4 font-inter-semibold text-lg text-charcoal">Quick Actions</Text>
          
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.push('/symptom-checker')}
              className="flex-1"
            >
              {({ pressed }) => (
                <Card className={`items-center justify-center py-6 border border-slate-100 ${pressed ? 'bg-slate-50' : 'bg-white'}`}>
                  <View className="mb-3 rounded-full bg-teal-50 p-4">
                    <Activity size={26} color="#0d9488" />
                  </View>
                  <Text className="font-inter-semibold text-center text-sm text-charcoal">
                    Check Symptoms
                  </Text>
                  <Text className="mt-1 font-inter text-center text-xs text-muted">
                    AI-powered diagnosis
                  </Text>
                </Card>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push('/doctor-booking')}
              className="flex-1"
            >
              {({ pressed }) => (
                <Card className={`items-center justify-center py-6 border border-slate-100 ${pressed ? 'bg-slate-50' : 'bg-white'}`}>
                  <View className="mb-3 rounded-full bg-cyan-50 p-4">
                    <Stethoscope size={26} color="#0891B2" />
                  </View>
                  <Text className="font-inter-semibold text-center text-sm text-charcoal">
                    Find a Doctor
                  </Text>
                  <Text className="mt-1 font-inter text-center text-xs text-muted">
                    Browse specialists
                  </Text>
                </Card>
              )}
            </Pressable>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View>
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-lg text-charcoal">
              Upcoming Appointments
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/appointments')}>
              <Text className="font-inter-semibold text-sm text-teal-600">See All</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.push('/(tabs)/appointments')}>
            {({ pressed }) => (
              <Card className={`border border-slate-100 ${pressed ? 'bg-slate-50' : 'bg-white'}`}>
                <View className="flex-row items-center justify-between border-b border-slate-100 pb-4">
                  <View className="flex-row items-center gap-3">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                      <Stethoscope size={20} color="#0d9488" />
                    </View>
                    <View>
                      <Text className="font-inter-bold text-charcoal text-base">Dr. Sarah Jenkins</Text>
                      <Text className="font-inter text-sm text-muted">Cardiology Specialist</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#94a3b8" />
                </View>

                <View className="pt-4 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <CalendarPlus size={16} color="#64748B" />
                    <Text className="font-inter-medium text-sm text-charcoal">
                      Oct 24, 2026 • 10:00 AM
                    </Text>
                  </View>
                  <View className="rounded-full bg-emerald-50 px-3 py-1 border border-emerald-100">
                    <Text className="font-inter-medium text-xs text-emerald-700">Confirmed</Text>
                  </View>
                </View>
              </Card>
            )}
          </Pressable>
        </View>

      </View>
    </ScrollView>
  );
}
