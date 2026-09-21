import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Video,
  Clock,
  CheckCircle2,
  X,
  Check,
  ChevronRight,
  UserCheck,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  notes?: string;
  meetingUrl?: string;
}

const FALLBACK_APPOINTMENTS: DoctorAppointment[] = [];

const STATUS_TABS: Array<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'> = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
];

export default function DoctorAppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(FALLBACK_APPOINTMENTS);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get<any[]>('/doctor/me/appointments').catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        const mapped: DoctorAppointment[] = res.data.map((item: any) => ({
          id: item.id,
          patientId: item.patientId || item.patient?.id || item.id,
          patientName: item.patient?.name || item.patientName || 'Patient',
          patientEmail: item.patient?.email,
          date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : (item.date || 'Scheduled Date'),
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.time || '10:00 AM'),
          status: item.status || 'CONFIRMED',
          type: item.type || 'Telehealth Video',
          notes: item.notes || item.symptoms,
          meetingUrl: item.meetingUrl,
        }));
        setAppointments(mapped);
      }
    } catch {
      // Retain fallback list
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

  const handleUpdateStatus = async (apptId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setActionLoadingId(apptId);
    try {
      await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update appointment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (selectedTab === 'ALL') return appointments;
    return appointments.filter((a) => a.status === selectedTab);
  }, [appointments, selectedTab]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049] space-y-3"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-slate-900 dark:text-[#F1F5F9]">Appointments</Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Manage clinical visits, review & consult
            </Text>
          </View>
          <View className="h-9 w-9 rounded-full bg-[#085041]/10 dark:bg-teal-950/60 items-center justify-center">
            <CalendarCheck size={18} color={isDark ? '#2DD4BF' : '#085041'} />
          </View>
        </View>

        {/* Tab Switcher Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-1.5 pt-1">
          {STATUS_TABS.map((tab) => {
            const isSelected = selectedTab === tab;
            const count = tab === 'ALL' ? appointments.length : appointments.filter((a) => a.status === tab).length;
            const label = tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase();

            return (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#085041] dark:bg-teal-600 border-[#085041] dark:border-teal-600'
                    : 'bg-slate-100 dark:bg-[#1C2338] border-transparent'
                }`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {label}
                </Text>
                <View
                  className={`px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-[#263049]'
                  }`}
                >
                  <Text
                    className={`font-inter-bold text-[10px] ${
                      isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Appointment Cards List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#085041']} />}
      >
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 items-center justify-center bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-2">
            <CalendarCheck size={36} color="#94A3B8" />
            <Text className="font-inter-semibold text-base text-slate-800 dark:text-slate-200">No appointments</Text>
            <Text className="font-inter text-xs text-slate-400 text-center">
              There are no appointments currently in this category.
            </Text>
          </Card>
        ) : (
          filteredAppointments.map((appt) => {
            const isPending = appt.status === 'PENDING';
            const isConfirmed = appt.status === 'CONFIRMED';
            const isCompleted = appt.status === 'COMPLETED';
            const isCancelled = appt.status === 'CANCELLED';
            const isLoadingThis = actionLoadingId === appt.id;

            return (
              <Card
                key={appt.id}
                className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3"
              >
                {/* Header row */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 items-center justify-center">
                      <Text className="font-inter-bold text-sm text-[#085041] dark:text-teal-400">
                        {appt.patientName.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">
                        {appt.patientName}
                      </Text>
                      <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">{appt.type}</Text>
                    </View>
                  </View>

                  <Badge
                    label={appt.status}
                    variant={
                      isConfirmed ? 'success' : isPending ? 'warning' : isCompleted ? 'info' : 'danger'
                    }
                  />
                </View>

                {/* Date & Time pill */}
                <View className="flex-row items-center gap-2 bg-slate-50 dark:bg-[#1C2338] px-3 py-2 rounded-xl border border-slate-100 dark:border-[#263049]">
                  <Clock size={15} color="#0D9488" />
                  <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">
                    {appt.date} • {appt.time}
                  </Text>
                </View>

                {/* Clinical Notes / Symptoms */}
                {appt.notes ? (
                  <View className="bg-slate-50 dark:bg-[#1C2338] px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Text className="font-inter text-xs text-slate-600 dark:text-slate-300">
                      <Text className="font-inter-semibold text-slate-800 dark:text-slate-200">Reason: </Text>
                      {appt.notes}
                    </Text>
                  </View>
                ) : null}

                {/* Dynamic Actions */}
                <View className="flex-row items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#263049]">
                  {isPending ? (
                    <>
                      <Pressable
                        disabled={isLoadingThis}
                        onPress={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#085041] dark:bg-teal-600"
                      >
                        {isLoadingThis ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Check size={16} color="#FFF" />
                            <Text className="font-inter-semibold text-xs text-white">Accept Appointment</Text>
                          </>
                        )}
                      </Pressable>

                      <Pressable
                        disabled={isLoadingThis}
                        onPress={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                        className="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40"
                      >
                        <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">Decline</Text>
                      </Pressable>
                    </>
                  ) : isConfirmed ? (
                    <>
                      <Pressable
                        onPress={() => router.push(`/consultation/${appt.id}` as any)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#085041] dark:bg-teal-600"
                      >
                        <Video size={16} color="#FFF" />
                        <Text className="font-inter-semibold text-xs text-white">Join Video Call</Text>
                      </Pressable>

                      <Pressable
                        disabled={isLoadingThis}
                        onPress={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                        className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      >
                        <CheckCircle2 size={15} color="#059669" />
                        <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">Complete</Text>
                      </Pressable>
                    </>
                  ) : null}

                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/(doctor-tabs)/patient-detail',
                        params: { id: appt.patientId },
                      } as any)
                    }
                    className={`flex-row items-center justify-center gap-1 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 ${
                      !isPending && !isConfirmed ? 'flex-1' : ''
                    }`}
                  >
                    <UserCheck size={14} color={isDark ? '#CBD5E1' : '#475569'} />
                    <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">Chart</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
