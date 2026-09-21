import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Users,
  Clock,
  CheckCircle2,
  Video,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  AlertTriangle,
  UserCheck,
  X,
  Check,
  RefreshCw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';

interface DashboardStats {
  todayAppointments: number;
  pendingApprovals: number;
  totalPatients: number;
  completedConsultations: number;
}

interface AppointmentItem {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  notes?: string;
  meetingUrl?: string;
}

interface PatientSummary {
  id: string;
  name: string;
  email: string;
  totalVisits: number;
  lastVisit?: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
}

const FALLBACK_STATS: DashboardStats = {
  todayAppointments: 0,
  pendingApprovals: 0,
  totalPatients: 0,
  completedConsultations: 0,
};

const FALLBACK_TODAY_APPTS: AppointmentItem[] = [];

const FALLBACK_RECENT_PATIENTS: PatientSummary[] = [];

export default function DoctorDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark, colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS);
  const [todayAppts, setTodayAppts] = useState<AppointmentItem[]>(FALLBACK_TODAY_APPTS);
  const [recentPatients, setRecentPatients] = useState<PatientSummary[]>(FALLBACK_RECENT_PATIENTS);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Stats
      const statsRes = await api.get<DashboardStats>('/doctor/me/dashboard-stats').catch(() => null);
      if (statsRes?.data) {
        setStats(statsRes.data);
      }

      // 2. Fetch Appointments
      const apptsRes = await api.get<any[]>('/doctor/me/appointments').catch(() => null);
      if (apptsRes?.data && Array.isArray(apptsRes.data)) {
        const mappedAppts: AppointmentItem[] = apptsRes.data.map((item: any) => ({
          id: item.id,
          patientName: item.patient?.name || item.patientName || 'Patient',
          patientId: item.patientId || item.patient?.id || item.id,
          date: item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString() : (item.date || 'Today'),
          time: item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.time || '10:00 AM'),
          status: item.status || 'CONFIRMED',
          type: item.type || 'Telehealth Video',
          notes: item.notes || item.symptoms || 'General Consultation',
          meetingUrl: item.meetingUrl,
        }));
        setTodayAppts(mappedAppts.slice(0, 5));
      }

      // 3. Fetch Patients
      const patientsRes = await api.get<any[]>('/doctor/me/patients').catch(() => null);
      if (patientsRes?.data && Array.isArray(patientsRes.data)) {
        const mappedPatients: PatientSummary[] = patientsRes.data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Patient',
          email: p.email || '',
          totalVisits: p.totalVisits || p._count?.appointments || 1,
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'Recent',
          riskLevel: p.riskLevel || (p.totalVisits > 4 ? 'High' : 'Low'),
        }));
        setRecentPatients(mappedPatients.slice(0, 4));
      }
    } catch {
      // Retain fallback data for smooth user experience
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleUpdateStatus = async (apptId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setActionLoadingId(apptId);
    try {
      await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus });
      setTodayAppts((prev) =>
        prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
      );
      // Refresh stats
      setStats((prev) => {
        if (newStatus === 'CONFIRMED') {
          return { ...prev, pendingApprovals: Math.max(0, prev.pendingApprovals - 1) };
        } else if (newStatus === 'COMPLETED') {
          return { ...prev, completedConsultations: prev.completedConsultations + 1 };
        }
        return prev;
      });
    } catch (err: any) {
      Alert.alert('Status Update Failed', err?.message || 'Could not update appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const doctorName = user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Specialist';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Header Bar */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049]"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 rounded-full bg-[#085041]/10 dark:bg-[#14B8A6]/20 border border-[#085041]/20 dark:border-[#14B8A6]/40 items-center justify-center">
              <Stethoscope size={22} color={isDark ? '#2DD4BF' : '#085041'} />
            </View>
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{doctorName}</Text>
                <ShieldCheck size={16} color="#0D9488" />
              </View>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Clinical Practice & Telehealth</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
            <View className="h-2 w-2 rounded-full bg-emerald-500" />
            <Text className="font-inter-semibold text-[11px] text-emerald-700 dark:text-emerald-400">Active</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#085041']} />}
      >
        {/* Metric Cards Grid */}
        <View className="flex-row flex-wrap gap-2.5">
          {/* Card 1: Today's Consultations */}
          <Card className="flex-1 min-w-[46%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                <CalendarCheck size={16} color="#0D9488" />
              </View>
              <Badge label="Today" variant="info" />
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{stats.todayAppointments}</Text>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Appointments</Text>
          </Card>

          {/* Card 2: Pending Approvals */}
          <Card className="flex-1 min-w-[46%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="h-7 w-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 items-center justify-center">
                <Clock size={16} color="#D97706" />
              </View>
              {stats.pendingApprovals > 0 && <Badge label="Action" variant="warning" />}
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{stats.pendingApprovals}</Text>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pending Approval</Text>
          </Card>

          {/* Card 3: Active Patients */}
          <Card className="flex-1 min-w-[46%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="h-7 w-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 items-center justify-center">
                <Users size={16} color="#0D9488" />
              </View>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{stats.totalPatients}</Text>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Assigned Patients</Text>
          </Card>

          {/* Card 4: Completed Consultations */}
          <Card className="flex-1 min-w-[46%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
            <View className="flex-row items-center justify-between mb-1.5">
              <View className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center">
                <CheckCircle2 size={16} color="#059669" />
              </View>
            </View>
            <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">{stats.completedConsultations}</Text>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Completed Visits</Text>
          </Card>
        </View>

        {/* Section: Today's Schedule & Actions */}
        <View className="space-y-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-inter-bold text-lg text-slate-900 dark:text-[#F1F5F9]">Today's Consultations</Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Scheduled clinical appointments</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(doctor-tabs)/appointments' as any)}
              className="flex-row items-center gap-1"
            >
              <Text className="font-inter-semibold text-xs text-[#085041] dark:text-teal-400">See all</Text>
              <ChevronRight size={14} color={isDark ? '#2DD4BF' : '#085041'} />
            </Pressable>
          </View>

          {todayAppts.length === 0 ? (
            <Card className="p-8 items-center justify-center bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <CalendarCheck size={36} color="#94A3B8" />
              <Text className="font-inter-semibold text-sm text-slate-700 dark:text-slate-300 mt-2">No appointments today</Text>
              <Text className="font-inter text-xs text-slate-400 text-center mt-1">Your consultation schedule is currently clear.</Text>
            </Card>
          ) : (
            todayAppts.map((appt) => {
              const isPending = appt.status === 'PENDING';
              const isConfirmed = appt.status === 'CONFIRMED';
              const isCompleted = appt.status === 'COMPLETED';
              const isLoadingThis = actionLoadingId === appt.id;

              return (
                <Card
                  key={appt.id}
                  className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="h-10 w-10 rounded-full bg-slate-100 dark:bg-[#1C2338] items-center justify-center">
                        <Text className="font-inter-bold text-sm text-slate-700 dark:text-slate-300">
                          {appt.patientName.charAt(0)}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-inter-semibold text-base text-slate-900 dark:text-[#F1F5F9]">
                          {appt.patientName}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          {appt.time} • {appt.type}
                        </Text>
                      </View>
                    </View>

                    <Badge
                      label={appt.status}
                      variant={
                        isConfirmed ? 'success' : isPending ? 'warning' : isCompleted ? 'info' : 'default'
                      }
                    />
                  </View>

                  {appt.notes ? (
                    <View className="bg-slate-50 dark:bg-[#1C2338] p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                      <Text className="font-inter text-xs text-slate-600 dark:text-slate-300 italic">
                        "{appt.notes}"
                      </Text>
                    </View>
                  ) : null}

                  {/* Actions Row */}
                  <View className="flex-row items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#263049]">
                    {isPending ? (
                      <>
                        <Pressable
                          disabled={isLoadingThis}
                          onPress={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                          className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl bg-[#085041] dark:bg-teal-600"
                        >
                          {isLoadingThis ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Check size={16} color="#FFF" />
                              <Text className="font-inter-semibold text-xs text-white">Accept Visit</Text>
                            </>
                          )}
                        </Pressable>

                        <Pressable
                          disabled={isLoadingThis}
                          onPress={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                          className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40"
                        >
                          <X size={16} color="#E11D48" />
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
                          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                        >
                          <CheckCircle2 size={16} color={isDark ? '#94A3B8' : '#475569'} />
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={() => router.push({ pathname: '/(doctor-tabs)/patient-detail', params: { id: appt.patientId } } as any)}
                        className="flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                      >
                        <UserCheck size={15} color={isDark ? '#CBD5E1' : '#475569'} />
                        <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">View Medical Chart</Text>
                      </Pressable>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </View>

        {/* Section: Recent Patients */}
        <View className="space-y-3 mt-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-inter-bold text-lg text-slate-900 dark:text-[#F1F5F9]">Recent Patients</Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Clinical history & triage status</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(doctor-tabs)/patients' as any)}
              className="flex-row items-center gap-1"
            >
              <Text className="font-inter-semibold text-xs text-[#085041] dark:text-teal-400">All patients</Text>
              <ChevronRight size={14} color={isDark ? '#2DD4BF' : '#085041'} />
            </Pressable>
          </View>

          {recentPatients.map((patient) => {
            const isHigh = patient.riskLevel === 'High';
            const isMod = patient.riskLevel === 'Moderate';

            return (
              <Pressable
                key={patient.id}
                onPress={() => router.push({ pathname: '/(doctor-tabs)/patient-detail', params: { id: patient.id } } as any)}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 items-center justify-center">
                    <Text className="font-inter-bold text-sm text-[#085041] dark:text-teal-400">
                      {patient.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text className="font-inter-semibold text-sm text-slate-900 dark:text-[#F1F5F9]">{patient.name}</Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      {patient.totalVisits} consult{patient.totalVisits === 1 ? '' : 's'} • Last: {patient.lastVisit}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <Badge
                    label={`${patient.riskLevel} Risk`}
                    variant={isHigh ? 'danger' : isMod ? 'warning' : 'success'}
                  />
                  <ChevronRight size={16} color="#94A3B8" />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
