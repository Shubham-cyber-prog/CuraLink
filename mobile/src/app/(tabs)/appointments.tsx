import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, Video, Clock, Stethoscope, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';

export interface MobileAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  meetingUrl?: string;
}

const FALLBACK_UPCOMING: MobileAppointment[] = [];

const FALLBACK_PAST: MobileAppointment[] = [];

export default function AppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcoming, setUpcoming] = useState<MobileAppointment[]>(FALLBACK_UPCOMING);
  const [past, setPast] = useState<MobileAppointment[]>(FALLBACK_PAST);
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchAppointments = React.useCallback(async () => {
    try {
      const response = await api.get<any>('/appointments/my-appointments').catch(() => null);
      if (response && response.data && Array.isArray(response.data)) {
        const fetched: MobileAppointment[] = response.data.map((item: any) => ({
          id: item.id || `appt_${Math.random()}`,
          doctorName: item.doctor?.name || item.doctorName || 'Dr. Health Specialist',
          specialty: item.doctor?.specialty || item.specialty || 'General Practice',
          date: item.date || (item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : 'Upcoming Date'),
          time: item.time || (item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'),
          status: item.status || 'CONFIRMED',
          meetingUrl: item.meetingUrl,
        }));

        setUpcoming(fetched.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING'));
        setPast(fetched.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'));
      }
    } catch {
      // Use standard initial fallbacks
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049] space-y-4"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">My Appointments</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">Manage your telehealth visits & history</Text>
          </View>
          <Pressable
            onPress={() => router.push('/doctor-booking')}
            className="bg-teal-600 dark:bg-teal-500 px-3.5 py-2 rounded-xl"
          >
            <Text className="font-inter-semibold text-xs text-white">+ Book Visit</Text>
          </Pressable>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row rounded-xl bg-slate-100 dark:bg-[#1C2338] p-1">
          <Pressable
            onPress={() => setFilterTab('upcoming')}
            className={`flex-1 py-2 rounded-lg items-center ${
              filterTab === 'upcoming' ? 'bg-white dark:bg-[#151B2E] shadow-sm' : ''
            }`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                filterTab === 'upcoming' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Upcoming ({upcoming.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilterTab('past')}
            className={`flex-1 py-2 rounded-lg items-center ${
              filterTab === 'past' ? 'bg-white dark:bg-[#151B2E] shadow-sm' : ''
            }`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                filterTab === 'past' ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Past Visits ({past.length})
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0D9488']} />}
      >
        {filterTab === 'upcoming' ? (
          upcoming.length === 0 ? (
            <Card className="items-center py-10 border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] space-y-3">
              <CalendarCheck size={36} color="#94A3B8" />
              <Text className="font-inter-semibold text-base text-charcoal dark:text-[#F1F5F9]">No upcoming appointments</Text>
              <Text className="font-inter text-xs text-muted dark:text-slate-400 text-center px-4">
                You don't have any scheduled appointments right now.
              </Text>
              <Button
                title="Book Consultation"
                onPress={() => router.push('/doctor-booking')}
              />
            </Card>
          ) : (
            <View className="space-y-4">
              {upcoming.map((appt) => (
                <Card key={appt.id} className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 space-y-4">
                  <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-3">
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60">
                        <Stethoscope size={20} color="#0D9488" />
                      </View>
                      <View>
                        <Text className="font-inter-bold text-charcoal dark:text-[#F1F5F9] text-base">{appt.doctorName}</Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400">{appt.specialty}</Text>
                      </View>
                    </View>
                    <Badge label={appt.status} variant="success" />
                  </View>

                  <View className="flex-row items-center gap-2.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 p-3 border border-teal-100 dark:border-teal-800/60">
                    <Clock size={16} color="#0D9488" />
                    <Text className="font-inter-medium text-xs text-teal-900 dark:text-teal-200">
                      {appt.date} • {appt.time}
                    </Text>
                  </View>

                  <Button
                    title="Join Video Consultation"
                    icon={Video}
                    iconPosition="left"
                    onPress={() => router.push(`/consultation/${appt.id}` as any)}
                  />
                </Card>
              ))}
            </View>
          )
        ) : (
          past.length === 0 ? (
            <Card className="items-center py-10 border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E]">
              <Text className="font-inter-semibold text-base text-charcoal dark:text-[#F1F5F9] mb-1">No past history</Text>
              <Text className="font-inter text-xs text-muted dark:text-slate-400">Completed visit history will appear here.</Text>
            </Card>
          ) : (
            <View className="space-y-4">
              {past.map((appt) => (
                <Card key={appt.id} className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 space-y-3 opacity-90">
                  <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-3">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1C2338]">
                        <Stethoscope size={18} color="#94A3B8" />
                      </View>
                      <View>
                        <Text className="font-inter-bold text-charcoal dark:text-[#F1F5F9] text-sm">{appt.doctorName}</Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400">{appt.specialty}</Text>
                      </View>
                    </View>
                    <Badge label={appt.status} variant={appt.status === 'COMPLETED' ? 'default' : 'danger'} />
                  </View>

                  <View className="flex-row items-center justify-between pt-1">
                    <View className="flex-row items-center gap-2">
                      <Clock size={14} color="#94A3B8" />
                      <Text className="font-inter text-xs text-muted dark:text-slate-400">{appt.date} • {appt.time}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push('/doctor-booking')}
                      className="flex-row items-center gap-1"
                    >
                      <Text className="font-inter-semibold text-xs text-teal-700 dark:text-teal-400">Book Again</Text>
                      <ChevronRight size={14} color="#0D9488" />
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}
