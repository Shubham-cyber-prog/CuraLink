import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Users,
  ShieldCheck,
  Clock,
  CalendarCheck,
  FileText,
  ShieldAlert,
  Activity,
  ArrowRight,
  TrendingUp,
  Server,
  Database,
  Lock,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { MotionView } from '../../components/Motion';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { CuraLinkLogo } from '../../components/CuraLinkLogo';

interface AdminStats {
  totalUsers: number;
  patientCount: number;
  doctorCount: number;
  verifiedDoctors: number;
  pendingVerifications: number;
  totalAppointments: number;
  totalPrescriptions: number;
  totalAuditLogs: number;
}

export default function AdminOverviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    patientCount: 0,
    doctorCount: 0,
    verifiedDoctors: 0,
    pendingVerifications: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalAuditLogs: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/stats');
      if (res?.data) {
        setStats({
          totalUsers: res.data.totalUsers ?? 0,
          patientCount: res.data.patientCount ?? 0,
          doctorCount: res.data.doctorCount ?? 0,
          verifiedDoctors: res.data.verifiedDoctors ?? 0,
          pendingVerifications: res.data.pendingVerifications ?? 0,
          totalAppointments: res.data.totalAppointments ?? 0,
          totalPrescriptions: res.data.totalPrescriptions ?? 0,
          totalAuditLogs: res.data.totalAuditLogs ?? 0,
        });
      }
    } catch (e) {
      console.warn('Could not load admin stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStats();
  }, [fetchStats]);

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D97706" />}
      >
        {/* Header Bar */}
        <View
          style={{ paddingTop: Math.max(insets.top + 8, 18) }}
          className="bg-white dark:bg-[#0B1F33] px-5 pb-4 border-b border-[#E6ECEF] dark:border-[#1B3650]"
        >
          <View className="flex-row items-center justify-between">
            <CuraLinkLogo size="sm" />
            <View className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <ShieldAlert size={12} color="#D97706" />
              <Text className="font-inter-bold text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Admin Console
              </Text>
            </View>
          </View>

          <View className="mt-3">
            <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">
              Platform Command Center
            </Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live healthcare network telemetrics • Logged in as {user?.email}
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#D97706" />
            <Text className="font-inter text-xs text-slate-400 mt-3">Loading platform telemetry...</Text>
          </View>
        ) : (
          <View className="px-5 pt-4 space-y-4">
            {/* Urgent Action Banner if Pending Verifications exist */}
            {stats.pendingVerifications > 0 && (
              <MotionView delay={30}>
                <TouchableOpacity
                  onPress={() => router.push('/(admin-tabs)/doctors')}
                  activeOpacity={0.85}
                  className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="h-10 w-10 rounded-2xl bg-amber-500/20 items-center justify-center">
                      <Clock size={20} color="#D97706" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-bold text-sm text-amber-900 dark:text-amber-300">
                        {stats.pendingVerifications} Pending Doctor Application{stats.pendingVerifications === 1 ? '' : 's'}
                      </Text>
                      <Text className="font-inter text-xs text-amber-700/80 dark:text-amber-400/80">
                        Review medical licenses &amp; verify credentials
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={18} color="#D97706" />
                </TouchableOpacity>
              </MotionView>
            )}

            {/* Core Metrics Grid */}
            <MotionView delay={60}>
              <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Network Telemetrics
              </Text>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {/* 1. Total Users */}
                <Card className="p-3.5" style={{ width: '48%' }}>
                  <View className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center mb-2">
                    <Users size={16} color="#2563EB" />
                  </View>
                  <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                    {stats.totalUsers}
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Total Registered
                  </Text>
                  <View className="mt-2 pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650] flex-row justify-between">
                    <Text className="font-inter text-[10px] text-slate-400">{stats.patientCount} Patients</Text>
                    <Text className="font-inter text-[10px] text-slate-400">{stats.doctorCount} Docs</Text>
                  </View>
                </Card>

                {/* 2. Verified Doctors */}
                <Card className="p-3.5" style={{ width: '48%' }}>
                  <View className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center mb-2">
                    <ShieldCheck size={16} color="#059669" />
                  </View>
                  <Text className="font-inter-bold text-2xl text-emerald-600 dark:text-emerald-400">
                    {stats.verifiedDoctors}
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Verified Doctors
                  </Text>
                  <View className="mt-2 pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650] flex-row justify-between">
                    <Text className="font-inter text-[10px] text-emerald-600 dark:text-emerald-400">NMC Approved</Text>
                    <Text className="font-inter text-[10px] text-amber-500">{stats.pendingVerifications} Pending</Text>
                  </View>
                </Card>

                {/* 3. Total Appointments */}
                <Card className="p-3.5" style={{ width: '48%' }}>
                  <View className="h-8 w-8 rounded-xl bg-teal-50 dark:bg-teal-950/40 items-center justify-center mb-2">
                    <CalendarCheck size={16} color="#006D77" />
                  </View>
                  <Text className="font-inter-bold text-2xl text-[#006D77] dark:text-[#83C5BE]">
                    {stats.totalAppointments}
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Consultations
                  </Text>
                  <View className="mt-2 pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650]">
                    <Text className="font-inter text-[10px] text-slate-400">Video &amp; Clinic Visits</Text>
                  </View>
                </Card>

                {/* 4. Digital Prescriptions */}
                <Card className="p-3.5" style={{ width: '48%' }}>
                  <View className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 items-center justify-center mb-2">
                    <FileText size={16} color="#9333EA" />
                  </View>
                  <Text className="font-inter-bold text-2xl text-purple-600 dark:text-purple-400">
                    {stats.totalPrescriptions}
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    E-Prescriptions
                  </Text>
                  <View className="mt-2 pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650]">
                    <Text className="font-inter text-[10px] text-slate-400">Digitally Signed Rx</Text>
                  </View>
                </Card>
              </View>
            </MotionView>

            {/* Quick Actions Card */}
            <MotionView delay={120}>
              <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Administrative Actions
              </Text>
              <Card className="p-2 divide-y divide-[#EDF3F4] dark:divide-[#1B3650]">
                <TouchableOpacity
                  onPress={() => router.push('/(admin-tabs)/doctors')}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 items-center justify-center">
                      <ShieldCheck size={18} color="#D97706" />
                    </View>
                    <View>
                      <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                        Doctor Credential Audits
                      </Text>
                      <Text className="font-inter text-xs text-slate-400">
                        {stats.pendingVerifications} pending NMC verification review
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color="#94A3B8" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push('/(admin-tabs)/users')}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-3.5"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 items-center justify-center">
                      <Users size={18} color="#2563EB" />
                    </View>
                    <View>
                      <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">
                        User &amp; Patient Registry
                      </Text>
                      <Text className="font-inter text-xs text-slate-400">
                        Inspect {stats.totalUsers} registered users across India
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={16} color="#94A3B8" />
                </TouchableOpacity>
              </Card>
            </MotionView>

            {/* Infrastructure Health Status */}
            <MotionView delay={180}>
              <Text className="mb-2 font-inter-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                System Infrastructure
              </Text>
              <Card className="p-4 space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <Server size={16} color="#059669" />
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                      Application Server
                    </Text>
                  </View>
                  <Badge label="Operational 99.9%" variant="success" />
                </View>

                <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                  <View className="flex-row items-center gap-2.5">
                    <Database size={16} color="#059669" />
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                      PostgreSQL Clinical Cluster
                    </Text>
                  </View>
                  <Badge label="Connected" variant="success" />
                </View>

                <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#1B3650] pt-2.5">
                  <View className="flex-row items-center gap-2.5">
                    <Lock size={16} color="#D97706" />
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                      HIPAA / DISHA Audit Vault
                    </Text>
                  </View>
                  <Text className="font-mono text-xs text-slate-500">{stats.totalAuditLogs} events</Text>
                </View>
              </Card>
            </MotionView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
