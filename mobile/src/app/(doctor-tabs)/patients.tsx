import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Users, ChevronRight, HeartPulse } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { MotionView, MotionPressable } from '../../components/Motion';
import { DoctorTopNav } from '../../components/DoctorTopNav';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

export interface MobilePatient {
  id: string;
  name: string;
  email: string;
  totalVisits: number;
  lastVisit: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  primaryCondition?: string;
}

const RISK_FILTERS = ['All', 'High Risk', 'Moderate', 'Low Risk'];

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [patients, setPatients] = useState<MobilePatient[]>([]);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get<any[]>('/doctor/me/patients').catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        setPatients(
          res.data.map((p: any) => ({
            id: p.id,
            name: p.name || 'Patient',
            email: p.email || '',
            totalVisits: p.totalVisits || 1,
            lastVisit: p.lastVisit || 'Recent',
            riskLevel: p.riskLevel || 'Low',
            primaryCondition: p.primaryCondition || 'General Consultation',
          }))
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch =
        patient.name.toLowerCase().includes(q) ||
        patient.email.toLowerCase().includes(q) ||
        (patient.primaryCondition && patient.primaryCondition.toLowerCase().includes(q));

      let matchesRisk = true;
      if (selectedRiskFilter === 'High Risk') matchesRisk = patient.riskLevel === 'High';
      else if (selectedRiskFilter === 'Moderate') matchesRisk = patient.riskLevel === 'Moderate';
      else if (selectedRiskFilter === 'Low Risk') matchesRisk = patient.riskLevel === 'Low';

      return matchesSearch && matchesRisk;
    });
  }, [patients, searchQuery, selectedRiskFilter]);

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      {/* ── TOP DOCTOR NAVIGATION BAR ── */}
      <DoctorTopNav currentTab="patients" />

      {/* Patient Search & Risk Filters Header */}
      <View className="bg-white dark:bg-[#0B1F33] px-5 py-3 border-b border-[#E6ECEF] dark:border-[#1B3650]">
        <View className="flex-row items-center bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] rounded-2xl px-3.5 py-2.5 mb-2.5">
          <Search size={16} color="#006D77" />
          <TextInput
            placeholder="Search patient name or condition..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2.5 font-inter text-sm text-[#0B1F33] dark:text-white py-0"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {RISK_FILTERS.map((filter) => {
            const active = selectedRiskFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedRiskFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full border ${
                  active
                    ? 'bg-[#006D77] border-[#006D77]'
                    : 'bg-[#F6F8F9] dark:bg-[#112942] border-[#E6ECEF] dark:border-[#1B3650]'
                }`}
              >
                <Text className={`font-inter-semibold text-xs ${active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'}`}>
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 100, 115),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchPatients();
            }}
            colors={['#006D77']}
          />
        }
      >
        {filteredPatients.length === 0 ? (
          <Card className="p-8 items-center space-y-2">
            <Users size={34} color="#94A3B8" />
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">No patients found</Text>
          </Card>
        ) : (
          filteredPatients.map((patient, idx) => (
            <MotionView key={patient.id} delay={Math.min(idx * 50, 240)}>
              <MotionPressable
                onPress={() =>
                  router.push({ pathname: '/(doctor-tabs)/patient-detail', params: { id: patient.id } } as any)
                }
              >
                <Card className="p-4 space-y-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-11 w-11 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Text className="font-inter-bold text-base text-[#006D77] dark:text-[#83C5BE]">
                          {patient.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {patient.name}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
                          {patient.email}
                        </Text>
                      </View>
                    </View>
                    <Badge
                      label={`${patient.riskLevel} Risk`}
                      variant={patient.riskLevel === 'High' ? 'danger' : patient.riskLevel === 'Moderate' ? 'warning' : 'success'}
                    />
                  </View>

                  {patient.primaryCondition ? (
                    <View className="bg-[#F4F7F8] dark:bg-[#112942] px-3 py-2 rounded-xl flex-row items-center gap-2">
                      <HeartPulse size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                      <Text className="font-inter-medium text-xs text-[#0B1F33] dark:text-slate-200">
                        {patient.primaryCondition}
                      </Text>
                    </View>
                  ) : null}

                  <View className="flex-row items-center justify-between pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650]">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      {patient.totalVisits} visit{patient.totalVisits === 1 ? '' : 's'} • {patient.lastVisit}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">Open Chart</Text>
                      <ChevronRight size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                    </View>
                  </View>
                </Card>
              </MotionPressable>
            </MotionView>
          ))
        )}
      </ScrollView>
    </View>
  );
}
