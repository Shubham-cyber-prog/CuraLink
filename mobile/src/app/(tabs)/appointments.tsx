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

const FALLBACK_UPCOMING: MobileAppointment[] = [
  {
    id: 'appt_101',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology Specialist',
    date: 'Today, Oct 24, 2026',
    time: '10:00 AM - 10:30 AM',
    status: 'CONFIRMED',
    meetingUrl: 'https://curalink.daily.co/consultation-101',
  },
];

const FALLBACK_PAST: MobileAppointment[] = [
  {
    id: 'appt_100',
    doctorName: 'Dr. Michael Chen',
    specialty: 'General Practice Physician',
    date: 'Oct 12, 2026',
    time: '02:00 PM',
    status: 'COMPLETED',
  },
  {
    id: 'appt_99',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'General Practice',
    date: 'Sep 28, 2026',
    time: '11:15 AM',
    status: 'COMPLETED',
  },
];

export default function AppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcoming, setUpcoming] = useState<MobileAppointment[]>(FALLBACK_UPCOMING);
  const [past, setPast] = useState<MobileAppointment[]>(FALLBACK_PAST);
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past'>('upcoming');

  const fetchAppointments = async () => {
    try {
      const response = await api.get<any>('/appointments/my-appointments').catch(() => null);
      if (response && response.data && Array.isArray(response.data)) {
        const fetched: MobileAppointment[] = response.data.map((item: any) => ({
          id: item.id || `appt_${Math.random()}`,
          doctorName: item.doctor?.name || item.doctorName || 'Dr. Health Specialist',
          specialty: item.doctor?.specialty || item.specialty || 'General Practice',
          date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : 'Upcoming Date',
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
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
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white px-5 pb-4 border-b border-slate-100 space-y-4"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-charcoal">My Appointments</Text>
            <Text className="font-inter text-xs text-muted">Manage your telehealth visits & history</Text>
          </View>
          <Pressable
            onPress={() => router.push('/doctor-booking')}
            className="bg-teal-600 px-3.5 py-2 rounded-xl"
          >
            <Text className="font-inter-semibold text-xs text-white">+ Book Visit</Text>
          </Pressable>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row rounded-xl bg-slate-100 p-1">
          <Pressable
            onPress={() => setFilterTab('upcoming')}
            className={`flex-1 py-2 rounded-lg items-center ${
              filterTab === 'upcoming' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                filterTab === 'upcoming' ? 'text-teal-700' : 'text-slate-600'
              }`}
            >
              Upcoming ({upcoming.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilterTab('past')}
            className={`flex-1 py-2 rounded-lg items-center ${
              filterTab === 'past' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                filterTab === 'past' ? 'text-teal-700' : 'text-slate-600'
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
            <Card className="items-center py-10 border border-slate-100 bg-white space-y-3">
              <CalendarCheck size={36} color="#94A3B8" />
              <Text className="font-inter-semibold text-base text-charcoal">No upcoming appointments</Text>
              <Text className="font-inter text-xs text-muted text-center px-4">
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
                <Card key={appt.id} className="border border-slate-100 bg-white p-4 space-y-4">
                  <View className="flex-row items-center justify-between border-b border-slate-100 pb-3">
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                        <Stethoscope size={20} color="#0D9488" />
                      </View>
                      <View>
                        <Text className="font-inter-bold text-charcoal text-base">{appt.doctorName}</Text>
                        <Text className="font-inter text-xs text-muted">{appt.specialty}</Text>
                      </View>
                    </View>
                    <Badge label={appt.status} variant="success" />
                  </View>

                  <View className="flex-row items-center gap-2.5 rounded-xl bg-teal-50/60 p-3 border border-teal-100">
                    <Clock size={16} color="#0D9488" />
                    <Text className="font-inter-medium text-xs text-teal-900">
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
            <Card className="items-center py-10 border border-slate-100 bg-white">
              <Text className="font-inter-semibold text-base text-charcoal mb-1">No past history</Text>
              <Text className="font-inter text-xs text-muted">Completed visit history will appear here.</Text>
            </Card>
          ) : (
            <View className="space-y-4">
              {past.map((appt) => (
                <Card key={appt.id} className="border border-slate-100 bg-white p-4 space-y-3 opacity-90">
                  <View className="flex-row items-center justify-between border-b border-slate-100 pb-3">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                        <Stethoscope size={18} color="#94A3B8" />
                      </View>
                      <View>
                        <Text className="font-inter-bold text-charcoal text-sm">{appt.doctorName}</Text>
                        <Text className="font-inter text-xs text-muted">{appt.specialty}</Text>
                      </View>
                    </View>
                    <Badge label={appt.status} variant={appt.status === 'COMPLETED' ? 'default' : 'danger'} />
                  </View>

                  <View className="flex-row items-center justify-between pt-1">
                    <View className="flex-row items-center gap-2">
                      <Clock size={14} color="#94A3B8" />
                      <Text className="font-inter text-xs text-muted">{appt.date} • {appt.time}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push('/doctor-booking')}
                      className="flex-row items-center gap-1"
                    >
                      <Text className="font-inter-semibold text-xs text-teal-700">Book Again</Text>
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
