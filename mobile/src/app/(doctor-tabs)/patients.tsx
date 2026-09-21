import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Users, ChevronRight, AlertTriangle, ShieldCheck, HeartPulse, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

export interface MobilePatient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalVisits: number;
  lastVisit: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  primaryCondition?: string;
}

const FALLBACK_PATIENTS: MobilePatient[] = [];

const RISK_FILTERS = ['All', 'High Risk', 'Moderate', 'Low Risk'];

export default function DoctorPatientsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const [patients, setPatients] = useState<MobilePatient[]>(FALLBACK_PATIENTS);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await api.get<any[]>('/doctor/me/patients').catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        const mapped: MobilePatient[] = res.data.map((p: any) => ({
          id: p.id,
          name: p.name || 'Patient',
          email: p.email || '',
          phone: p.phone || undefined,
          totalVisits: p.totalVisits || p._count?.appointments || 1,
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'Recent',
          riskLevel: p.riskLevel || (p.totalVisits > 4 ? 'High' : 'Low'),
          primaryCondition: p.primaryCondition || 'General Consultation',
        }));
        setPatients(mapped);
      }
    } catch {
      // Retain fallback list
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients();
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = searchQuery.toLowerCase();
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
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049] space-y-3"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-slate-900 dark:text-[#F1F5F9]">Patient Registry</Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Clinical charts, longitudinal vitals & records
            </Text>
          </View>
          <View className="h-9 w-9 rounded-full bg-[#085041]/10 dark:bg-teal-950/60 items-center justify-center">
            <Users size={18} color={isDark ? '#2DD4BF' : '#085041'} />
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-slate-100 dark:bg-[#1C2338] rounded-xl px-3 py-2 border border-slate-200 dark:border-[#263049]">
          <Search size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search patient name, email or diagnosis..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 font-inter text-sm text-slate-900 dark:text-[#F1F5F9] py-0"
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 pt-1">
          {RISK_FILTERS.map((filter) => {
            const isSelected = selectedRiskFilter === filter;
            return (
              <Pressable
                key={filter}
                onPress={() => setSelectedRiskFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full border ${
                  isSelected
                    ? 'bg-[#085041] dark:bg-teal-600 border-[#085041] dark:border-teal-600'
                    : 'bg-white dark:bg-[#151B2E] border-slate-200 dark:border-[#263049]'
                }`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Patient List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#085041']} />}
      >
        {filteredPatients.length === 0 ? (
          <Card className="p-8 items-center justify-center bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-2">
            <Users size={36} color="#94A3B8" />
            <Text className="font-inter-semibold text-base text-slate-800 dark:text-slate-200">No patients found</Text>
            <Text className="font-inter text-xs text-slate-400 text-center">
              Try adjusting your search criteria or triage risk filter.
            </Text>
          </Card>
        ) : (
          filteredPatients.map((patient) => {
            const isHigh = patient.riskLevel === 'High';
            const isMod = patient.riskLevel === 'Moderate';

            return (
              <Pressable
                key={patient.id}
                onPress={() =>
                  router.push({
                    pathname: '/(doctor-tabs)/patient-detail',
                    params: { id: patient.id },
                  } as any)
                }
              >
                <Card className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-11 w-11 rounded-full bg-slate-100 dark:bg-[#1C2338] items-center justify-center border border-slate-200 dark:border-[#263049]">
                        <Text className="font-inter-bold text-base text-[#085041] dark:text-teal-400">
                          {patient.name.charAt(0)}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]" numberOfLines={1}>
                          {patient.name}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
                          {patient.email}
                        </Text>
                      </View>
                    </View>

                    <Badge
                      label={`${patient.riskLevel} Risk`}
                      variant={isHigh ? 'danger' : isMod ? 'warning' : 'success'}
                    />
                  </View>

                  {patient.primaryCondition ? (
                    <View className="bg-slate-50 dark:bg-[#1C2338] px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 flex-row items-center gap-2">
                      <HeartPulse size={14} color="#0D9488" />
                      <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {patient.primaryCondition}
                      </Text>
                    </View>
                  ) : null}

                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-100 dark:border-[#263049]">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      {patient.totalVisits} visits • Last: {patient.lastVisit}
                    </Text>

                    <View className="flex-row items-center gap-1">
                      <Text className="font-inter-semibold text-xs text-[#085041] dark:text-teal-400">
                        Open Chart
                      </Text>
                      <ChevronRight size={14} color={isDark ? '#2DD4BF' : '#085041'} />
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
