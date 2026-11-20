import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, Pressable, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Video,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  UserCheck,
  X,
  Check,
  MessageCircle,
  FileText,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Shield,
  Activity,
  Award,
  IndianRupee,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { MotionView, MotionPressable } from '../../components/Motion';
import { DoctorTopNav } from '../../components/DoctorTopNav';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';

interface DashboardStats {
  todayAppointments: number;
  pendingRequests: number;
  totalPatients: number;
  completedConsultations: number;
  consultationFee?: number;
  averageRating?: number;
}

interface ActiveAppointmentItem {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  time: string;
  status: string;
  type: string;
  fee: number;
  notes?: string;
}

export default function DoctorDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    pendingRequests: 0,
    totalPatients: 0,
    completedConsultations: 0,
    consultationFee: 500,
    averageRating: 4.9,
  });
  const [activeSession, setActiveSession] = useState<ActiveAppointmentItem | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, apptsRes] = await Promise.all([
        api.get<any>('/doctor/me/dashboard-stats').catch(() => null),
        api.get<any[]>('/doctor/me/appointments').catch(() => null),
      ]);

      if (statsRes?.data) {
        setStats({
          todayAppointments: statsRes.data.todayAppointments || 0,
          pendingRequests: statsRes.data.pendingRequests ?? statsRes.data.pendingApprovals ?? 0,
          totalPatients: statsRes.data.totalPatients || 0,
          completedConsultations: statsRes.data.completedConsultations || 0,
          consultationFee: statsRes.data.consultationFee || 500,
          averageRating: statsRes.data.averageRating || 4.9,
        });
      }

      if (apptsRes?.data && Array.isArray(apptsRes.data)) {
        // Find next active confirmed or pending consultation
        const confirmed = apptsRes.data.find(
          (a: any) => (a.status || '').toUpperCase() === 'CONFIRMED'
        );
        const target = confirmed || apptsRes.data[0];

        if (target) {
          setActiveSession({
            id: target.id,
            patientName: target.user?.name || target.patient?.name || target.patientName || 'Patient',
            patientId: target.userId || target.user?.id || target.patientId || target.id,
            date: target.date || (target.scheduledAt ? new Date(target.scheduledAt).toLocaleDateString('en-IN') : 'Today'),
            time: target.time || '10:30 AM',
            status: (target.status || 'CONFIRMED').toUpperCase(),
            type: target.type || 'Video Consultation',
            fee: target.payment?.amount || target.fee || 500,
            notes: target.notes || target.symptoms,
          });
        } else {
          setActiveSession(null);
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const doctorName = user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Specialist';

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      {/* ── TOP DOCTOR NAVIGATION BAR ── */}
      <DoctorTopNav currentTab="index" pendingCount={stats.pendingRequests} />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 110, 125),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchDashboardData();
            }}
            colors={['#006D77']}
          />
        }
      >
        {/* ── 1. LIVE TELEHEALTH SPOTLIGHT BANNER ── */}
        {activeSession ? (
          <MotionView delay={30}>
            <View className="rounded-3xl bg-[#006D77] p-5 shadow-sm overflow-hidden relative">
              <View className="absolute -right-8 -bottom-8 h-36 w-36 rounded-full bg-[#83C5BE]/20" />

              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                  <View className="h-2 w-2 rounded-full bg-emerald-300" />
                  <Text className="font-inter-bold text-[10px] text-white uppercase tracking-wider">
                    {activeSession.status === 'CONFIRMED' ? 'Next Active Telehealth Call' : 'Upcoming Session'}
                  </Text>
                </View>
                <Text className="font-inter-semibold text-xs text-[#83C5BE]">
                  {activeSession.date} • {activeSession.time}
                </Text>
              </View>

              <View className="flex-row items-center gap-3 mb-4">
                <View className="h-12 w-12 rounded-2xl bg-white/20 items-center justify-center">
                  <Text className="font-inter-bold text-lg text-white">
                    {activeSession.patientName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-lg text-white" numberOfLines={1}>
                    {activeSession.patientName}
                  </Text>
                  <Text className="font-inter text-xs text-white/80">
                    {activeSession.type} • Fee ₹{activeSession.fee}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={() => router.push(`/consultation/${activeSession.id}` as any)}
                  activeOpacity={0.85}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-white py-3 shadow-sm"
                >
                  <Video size={16} color="#006D77" />
                  <Text className="font-inter-bold text-xs text-[#006D77]">
                    Join HD Video Room
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(doctor-tabs)/appointments' as any)}
                  activeOpacity={0.85}
                  className="px-4 py-3 rounded-full bg-white/15 border border-white/30"
                >
                  <Text className="font-inter-semibold text-xs text-white">
                    View Queue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotionView>
        ) : null}

        {/* ── 2. EXECUTIVE 4-METRIC CLINICAL KPI GRID ── */}
        <MotionView delay={60}>
          <View className="flex-row flex-wrap gap-2.5">
            {/* KPI 1: Today's Queue */}
            <TouchableOpacity
              onPress={() => router.push('/(doctor-tabs)/appointments' as any)}
              activeOpacity={0.8}
              className="flex-1 min-w-[48%] rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs justify-between"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-inter-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Today's Queue
                </Text>
                <View className="h-7 w-7 rounded-lg bg-[#EAF4F5] dark:bg-[#112A44] items-center justify-center">
                  <CalendarCheck size={14} color="#006D77" />
                </View>
              </View>
              <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                {stats.todayAppointments}
              </Text>
              <Text className="font-inter-semibold text-[11px] text-[#006D77] dark:text-[#83C5BE] mt-1">
                Open Schedule →
              </Text>
            </TouchableOpacity>

            {/* KPI 2: Pending Approval */}
            <TouchableOpacity
              onPress={() => router.push('/(doctor-tabs)/appointments' as any)}
              activeOpacity={0.8}
              className={`flex-1 min-w-[48%] rounded-2xl p-4 border shadow-xs justify-between ${
                stats.pendingRequests > 0
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                  : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
              }`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-inter-bold text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Pending Review
                </Text>
                <View className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 items-center justify-center">
                  <Clock size={14} color="#D97706" />
                </View>
              </View>
              <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                {stats.pendingRequests}
              </Text>
              <Text className="font-inter-semibold text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                {stats.pendingRequests > 0 ? 'Needs Attention →' : 'All Approved'}
              </Text>
            </TouchableOpacity>

            {/* KPI 3: Active Patients */}
            <TouchableOpacity
              onPress={() => router.push('/(doctor-tabs)/patients' as any)}
              activeOpacity={0.8}
              className="flex-1 min-w-[48%] rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs justify-between"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-inter-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Patients
                </Text>
                <View className="h-7 w-7 rounded-lg bg-[#EDE9FE] dark:bg-[#2E1065] items-center justify-center">
                  <Users size={14} color="#7C3AED" />
                </View>
              </View>
              <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                {stats.totalPatients}
              </Text>
              <Text className="font-inter-semibold text-[11px] text-[#7C3AED] dark:text-purple-300 mt-1">
                Open Directory →
              </Text>
            </TouchableOpacity>

            {/* KPI 4: Practice Hours */}
            <TouchableOpacity
              onPress={() => router.push('/(doctor-tabs)/schedule' as any)}
              activeOpacity={0.8}
              className="flex-1 min-w-[48%] rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs justify-between"
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className="font-inter-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Completed Visits
                </Text>
                <View className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 items-center justify-center">
                  <CheckCircle2 size={14} color="#059669" />
                </View>
              </View>
              <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                {stats.completedConsultations}
              </Text>
              <Text className="font-inter-semibold text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
                Fee: ₹{stats.consultationFee}
              </Text>
            </TouchableOpacity>
          </View>
        </MotionView>

        {/* ── 3. FOUR DISTINCT CLINICAL MODULE CARDS (Explicit Navigation) ── */}
        <MotionView delay={90}>
          <View className="space-y-3">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white uppercase tracking-wider">
              Clinical Management Workspace
            </Text>

            {/* Module 1: Appointments */}
            <MotionPressable
              onPress={() => router.push('/(doctor-tabs)/appointments' as any)}
              className="rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                <View className="h-11 w-11 rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44] items-center justify-center">
                  <CalendarCheck size={21} color="#006D77" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                      Consultations &amp; Video Visits
                    </Text>
                    {stats.pendingRequests > 0 && (
                      <Badge label={`${stats.pendingRequests} New`} variant="warning" />
                    )}
                  </View>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live video calls, approval queue &amp; digitally signed E-Prescriptions
                  </Text>
                </View>
              </View>
              <View className="h-8 w-8 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center">
                <ChevronRight size={16} color="#006D77" />
              </View>
            </MotionPressable>

            {/* Module 2: Schedule & Slots */}
            <MotionPressable
              onPress={() => router.push('/(doctor-tabs)/schedule' as any)}
              className="rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                <View className="h-11 w-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 items-center justify-center">
                  <Calendar size={21} color="#0891B2" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                      Doctor Schedule &amp; Slots
                    </Text>
                    <Badge label="Live Availability" variant="success" />
                  </View>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Working hours, morning/evening shifts &amp; consultation modes
                  </Text>
                </View>
              </View>
              <View className="h-8 w-8 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center">
                <ChevronRight size={16} color="#0891B2" />
              </View>
            </MotionPressable>

            {/* Module 3: Patient Registry */}
            <MotionPressable
              onPress={() => router.push('/(doctor-tabs)/patients' as any)}
              className="rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                <View className="h-11 w-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 items-center justify-center">
                  <Users size={21} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                    Patient Registry &amp; Charts
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Longitudinal vitals, chronic risk profiles &amp; full medical records
                  </Text>
                </View>
              </View>
              <View className="h-8 w-8 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center">
                <ChevronRight size={16} color="#7C3AED" />
              </View>
            </MotionPressable>

            {/* Module 4: Practice & Fee Profile */}
            <MotionPressable
              onPress={() => router.push('/(doctor-tabs)/profile' as any)}
              className="rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                <View className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center">
                  <Stethoscope size={21} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                    Practice &amp; Fee Adjustment
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Adjust consultation fee (₹{stats.consultationFee}), hospital affiliation &amp; bio
                  </Text>
                </View>
              </View>
              <View className="h-8 w-8 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center">
                <ChevronRight size={16} color="#059669" />
              </View>
            </MotionPressable>

            {/* Module 5: Earnings & Settlements */}
            <MotionPressable
              onPress={() => router.push('/(doctor-tabs)/earnings' as any)}
              className="rounded-2xl bg-white dark:bg-[#0B1F33] p-4 border border-[#E2E8F0] dark:border-[#163656] shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3.5 flex-1 pr-3">
                <View className="h-11 w-11 rounded-2xl bg-teal-50 dark:bg-teal-950/40 items-center justify-center">
                  <IndianRupee size={21} color="#006D77" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                      Earnings &amp; Payouts
                    </Text>
                    <Badge label="1D • 7D • 1M • 1Y" variant="success" />
                  </View>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live revenue analytics, interactive chart &amp; instant bank transfers
                  </Text>
                </View>
              </View>
              <View className="h-8 w-8 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] items-center justify-center">
                <ChevronRight size={16} color="#006D77" />
              </View>
            </MotionPressable>
          </View>
        </MotionView>

        {/* ── 4. CLINICAL COMPLIANCE & PROTOCOL BADGE ── */}
        <MotionView delay={120}>
          <Card className="p-4 bg-white dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656] space-y-2">
            <View className="flex-row items-center gap-2">
              <ShieldCheck size={18} color="#006D77" />
              <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                Telemedicine Practice Guidelines 2026 Compliant
              </Text>
            </View>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every virtual consultation is protected by 256-bit AES encryption. Issued e-prescriptions conform with registered medical practitioner digital stamping standards.
            </Text>
          </Card>
        </MotionView>
      </ScrollView>
    </View>
  );
}
