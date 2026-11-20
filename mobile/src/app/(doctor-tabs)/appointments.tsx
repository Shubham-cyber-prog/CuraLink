import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Video,
  Clock,
  CheckCircle2,
  Check,
  UserCheck,
  MessageCircle,
  Pill,
  FileText,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView, MotionPressable } from '../../components/Motion';
import { DoctorTopNav } from '../../components/DoctorTopNav';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  type: string;
  notes?: string;
  hasPrescription?: boolean;
}

const COMMON_DRUGS = [
  { name: 'Paracetamol', dosage: '650mg', frequency: '1-0-1', duration: '3 days', instructions: 'After meals' },
  { name: 'Azithromycin', dosage: '500mg', frequency: '0-0-1', duration: '3 days', instructions: 'Before dinner' },
  { name: 'Pantoprazole', dosage: '40mg', frequency: '1-0-0', duration: '7 days', instructions: 'Empty stomach' },
  { name: 'Cetirizine', dosage: '10mg', frequency: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
  { name: 'Amoxicillin', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After food' },
  { name: 'Metformin', dosage: '500mg', frequency: '1-0-1', duration: '30 days', instructions: 'With meals' },
  { name: 'Telmisartan', dosage: '40mg', frequency: '1-0-0', duration: '30 days', instructions: 'Morning' },
];

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

  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // E-Rx Modal State
  const [rxAppt, setRxAppt] = useState<DoctorAppointment | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState<
    Array<{ name: string; dosage: string; frequency: string; duration: string; instructions: string }>
  >([
    { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
  ]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isIssuingRx, setIsIssuingRx] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await api.get<any[]>('/doctor/me/appointments').catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        setAppointments(
          res.data.map((item: any) => ({
            id: item.id,
            patientId: item.userId || item.user?.id || item.patientId || item.patient?.id || item.id,
            patientName: item.user?.name || item.patient?.name || item.patientName || 'Patient',
            date: item.date || (item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('en-IN') : 'Today'),
            time: item.time || '10:30 AM',
            status: item.status || 'CONFIRMED',
            type: item.type || 'Video Consultation',
            notes: item.notes || item.symptoms,
            hasPrescription: Boolean(item.prescription),
          }))
        );
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async (apptId: string, newStatus: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => {
    setActionLoadingId(apptId);
    try {
      await api.patch(`/doctor/me/appointments/${apptId}`, { status: newStatus });
      setAppointments((prev) => prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a)));
    } catch (err: any) {
      Alert.alert('Update Failed', err?.message || 'Could not update appointment status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRxModal = (appt: DoctorAppointment) => {
    setRxAppt(appt);
    setDiagnosis(appt.notes || '');
    setMedications([
      { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
    ]);
    setClinicalNotes('');
  };

  const handleAddMedRow = () => {
    setMedications((prev) => [
      ...prev,
      { name: '', dosage: '500mg', frequency: '1-0-1', duration: '5 days', instructions: 'After meals' },
    ]);
  };

  const handleAddCommonDrug = (drug: typeof COMMON_DRUGS[0]) => {
    setMedications((prev) => {
      if (prev.length === 1 && !prev[0].name.trim()) {
        return [drug];
      }
      return [...prev, drug];
    });
  };

  const handleRemoveMedRow = (index: number) => {
    if (medications.length <= 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMed = (index: number, field: string, val: string) => {
    setMedications((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  };

  const handleIssuePrescription = async () => {
    if (!rxAppt) return;
    if (!diagnosis.trim() || diagnosis.trim().length < 3) {
      Alert.alert('Missing Diagnosis', 'Please enter a valid clinical diagnosis (at least 3 characters).');
      return;
    }
    const validMeds = medications.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      Alert.alert('Missing Medications', 'Please prescribe at least one medication with a valid name.');
      return;
    }

    setIsIssuingRx(true);
    try {
      const res = await api.post('/doctor/me/prescriptions', {
        appointmentId: rxAppt.id,
        patientId: rxAppt.patientId,
        diagnosis: diagnosis.trim(),
        medications: validMeds,
        notes: clinicalNotes.trim(),
      });

      if (res?.data || res?.success) {
        await api.patch(`/doctor/me/appointments/${rxAppt.id}`, { status: 'COMPLETED' }).catch(() => null);
        Alert.alert(
          'Prescription Issued',
          `E-Prescription has been digitally signed and securely synced with ${rxAppt.patientName}'s medical vault.`
        );
        setRxAppt(null);
        await fetchAppointments();
      } else {
        throw new Error(res?.message || 'Failed to issue prescription.');
      }
    } catch (err: any) {
      Alert.alert('Issuance Failed', err?.message || 'Could not issue e-prescription. Please verify patient data.');
    } finally {
      setIsIssuingRx(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (selectedTab === 'ALL') return appointments;
    return appointments.filter((a) => a.status === selectedTab);
  }, [appointments, selectedTab]);

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      {/* ── TOP DOCTOR NAVIGATION BAR ── */}
      <DoctorTopNav
        currentTab="appointments"
        pendingCount={appointments.filter((a) => a.status === 'PENDING').length}
      />

      {/* Status Filter Bar */}
      <View className="bg-white dark:bg-[#0B1F33] px-5 py-3 border-b border-[#E6ECEF] dark:border-[#1B3650]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {STATUS_TABS.map((tab) => {
            const active = selectedTab === tab;
            const count = tab === 'ALL' ? appointments.length : appointments.filter((a) => a.status === tab).length;
            const label = tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase();
            return (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 border ${
                  active
                    ? 'bg-[#006D77] border-[#006D77]'
                    : 'bg-[#F6F8F9] dark:bg-[#112942] border-[#E6ECEF] dark:border-[#1B3650]'
                }`}
              >
                <Text className={`font-inter-semibold text-xs ${active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'}`}>
                  {label}
                </Text>
                <Text className={`font-inter-bold text-[10px] ${active ? 'text-white/85' : 'text-slate-400'}`}>
                  {count}
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
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchAppointments();
            }}
            colors={['#006D77']}
          />
        }
      >
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 items-center space-y-2">
            <CalendarCheck size={34} color="#94A3B8" />
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">No appointments</Text>
          </Card>
        ) : (
          filteredAppointments.map((appt, idx) => {
            const isPending = appt.status === 'PENDING';
            const isConfirmed = appt.status === 'CONFIRMED';
            const busy = actionLoadingId === appt.id;

            return (
              <MotionView key={appt.id} delay={Math.min(idx * 50, 240)}>
                <Card className="p-4 space-y-3">
                  <View className="flex-row items-center justify-between gap-2">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-11 w-11 rounded-2xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                          {appt.patientName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {appt.patientName}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">{appt.type}</Text>
                      </View>
                    </View>
                    <Badge
                      label={appt.status}
                      variant={isConfirmed ? 'success' : isPending ? 'warning' : appt.status === 'COMPLETED' ? 'info' : 'danger'}
                    />
                  </View>

                  <View className="flex-row items-center gap-2 bg-[#F4F7F8] dark:bg-[#112942] px-3.5 py-2.5 rounded-2xl">
                    <Clock size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">
                      {appt.date} • {appt.time}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2 pt-2 border-t border-[#EDF3F4] dark:border-[#1B3650]">
                    {isPending ? (
                      <>
                        <View className="flex-1">
                          <MotionPressable
                            disabled={busy}
                            onPress={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                            className="flex-row items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#006D77]"
                          >
                            {busy ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <>
                                <Check size={15} color="#FFF" />
                                <Text className="font-inter-semibold text-xs text-white">Accept</Text>
                              </>
                            )}
                          </MotionPressable>
                        </View>
                        <MotionPressable
                          disabled={busy}
                          onPress={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                          className="px-4 py-2.5 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
                        >
                          <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">Decline</Text>
                        </MotionPressable>
                      </>
                    ) : isConfirmed ? (
                      <>
                        <View className="flex-1">
                          <MotionPressable
                            onPress={() => router.push(`/consultation/${appt.id}` as any)}
                            className="flex-row items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#006D77]"
                          >
                            <Video size={15} color="#FFF" />
                            <Text className="font-inter-semibold text-xs text-white">Join Call</Text>
                          </MotionPressable>
                        </View>
                        <MotionPressable
                          onPress={() =>
                            router.push({
                              pathname: '/chat',
                              params: { appointmentId: appt.id, doctorName: appt.patientName },
                            })
                          }
                          className="h-10 w-10 items-center justify-center rounded-full bg-[#EAF4F5] dark:bg-[#112942]"
                        >
                          <MessageCircle size={16} color={isDark ? '#83C5BE' : '#006D77'} />
                        </MotionPressable>
                        <MotionPressable
                          disabled={busy}
                          onPress={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                          className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40"
                        >
                          <CheckCircle2 size={16} color="#059669" />
                        </MotionPressable>
                      </>
                    ) : null}

                    {(isConfirmed || appt.status === 'COMPLETED') && (
                      <MotionPressable
                        onPress={() => handleOpenRxModal(appt)}
                        className={`flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-full border ${
                          appt.hasPrescription
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                            : 'bg-[#EAF4F5] dark:bg-[#112942] border-[#006D77]/30'
                        }`}
                      >
                        <Pill size={14} color={appt.hasPrescription ? '#059669' : (isDark ? '#83C5BE' : '#006D77')} />
                        <Text
                          className={`font-inter-semibold text-xs ${
                            appt.hasPrescription
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-[#006D77] dark:text-[#83C5BE]'
                          }`}
                        >
                          {appt.hasPrescription ? 'Update Rx' : 'Write Rx'}
                        </Text>
                      </MotionPressable>
                    )}

                    <MotionPressable
                      onPress={() =>
                        router.push({ pathname: '/(doctor-tabs)/patient-detail', params: { id: appt.patientId } } as any)
                      }
                      className="flex-row items-center justify-center gap-1 py-2.5 px-3.5 rounded-full border border-[#E2E9EC] dark:border-[#1B3650]"
                    >
                      <UserCheck size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                      <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">Chart</Text>
                    </MotionPressable>
                  </View>
                </Card>
              </MotionView>
            );
          })
        )}
      </ScrollView>

      {/* ── DOCTOR DIGITAL PRESCRIPTION (E-RX) BUILDER MODAL ── */}
      <Modal visible={Boolean(rxAppt)} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 max-h-[90%] border-t border-[#E2E8F0] dark:border-[#163656]"
          >
            {/* Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-[#EDF3F4] dark:border-[#163656]">
              <View className="flex-1 pr-2">
                <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                  Issue Digital Prescription (E-Rx)
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  For {rxAppt?.patientName} • {rxAppt?.date}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRxAppt(null)}
                className="h-8 w-8 rounded-full items-center justify-center bg-[#F4F7F8] dark:bg-[#112A44]"
              >
                <X size={16} color={isDark ? '#FFFFFF' : '#0B1F33'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 14 }}>
              {/* NMC Telemedicine Banner */}
              <View className="flex-row items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200 dark:border-emerald-800">
                <View className="flex-row items-center gap-2">
                  <ShieldCheck size={16} color="#10B981" />
                  <Text className="font-inter-semibold text-xs text-emerald-800 dark:text-emerald-300">
                    NMC Telemedicine Verified Prescription
                  </Text>
                </View>
                <Text className="font-inter-bold text-[10px] text-emerald-700 dark:text-emerald-400">
                  SHA-256 Signed
                </Text>
              </View>

              {/* Diagnosis Input */}
              <View className="space-y-1">
                <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                  Clinical Diagnosis *
                </Text>
                <TextInput
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="e.g. Acute Viral Bronchitis, Essential Hypertension"
                  placeholderTextColor="#94A3B8"
                  className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3.5 py-2.5 font-inter text-xs text-[#0B1F33] dark:text-white"
                />
              </View>

              {/* Quick Drugs Library */}
              <View className="space-y-1.5">
                <Text className="font-inter-semibold text-xs text-slate-600 dark:text-slate-400">
                  Quick Drug Templates (tap to add):
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {COMMON_DRUGS.map((d) => (
                    <TouchableOpacity
                      key={d.name}
                      onPress={() => handleAddCommonDrug(d)}
                      className="px-2.5 py-1.5 rounded-full bg-[#EAF4F5] dark:bg-[#112A44] border border-[#C7E3E5] dark:border-[#163656]"
                    >
                      <Text className="font-inter-semibold text-[11px] text-[#006D77] dark:text-[#83C5BE]">
                        + {d.name} ({d.dosage})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Dynamic Medication Rows */}
              <View className="space-y-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400">
                    Prescribed Medicines ({medications.length})
                  </Text>
                  <TouchableOpacity
                    onPress={handleAddMedRow}
                    className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-[#006D77]"
                  >
                    <Plus size={13} color="#FFFFFF" />
                    <Text className="font-inter-bold text-[11px] text-white">Add Medicine</Text>
                  </TouchableOpacity>
                </View>

                {medications.map((med, idx) => (
                  <Card
                    key={idx}
                    className="p-3 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656] space-y-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                        Medicine #{idx + 1}
                      </Text>
                      {medications.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveMedRow(idx)}>
                          <Trash2 size={15} color="#E11D48" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Drug Name */}
                    <TextInput
                      value={med.name}
                      onChangeText={(val) => handleUpdateMed(idx, 'name', val)}
                      placeholder="Brand or Generic Name (e.g. Paracetamol 650mg)"
                      placeholderTextColor="#94A3B8"
                      className="bg-white dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3 py-2 font-inter text-xs text-[#0B1F33] dark:text-white"
                    />

                    {/* Dosage, Frequency, Duration */}
                    <View className="flex-row gap-2">
                      <TextInput
                        value={med.dosage}
                        onChangeText={(val) => handleUpdateMed(idx, 'dosage', val)}
                        placeholder="Dose (500mg)"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 bg-white dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3 py-2 font-inter text-xs text-[#0B1F33] dark:text-white"
                      />
                      <TextInput
                        value={med.frequency}
                        onChangeText={(val) => handleUpdateMed(idx, 'frequency', val)}
                        placeholder="Freq (1-0-1)"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 bg-white dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3 py-2 font-inter text-xs text-[#0B1F33] dark:text-white"
                      />
                      <TextInput
                        value={med.duration}
                        onChangeText={(val) => handleUpdateMed(idx, 'duration', val)}
                        placeholder="Duration (5d)"
                        placeholderTextColor="#94A3B8"
                        className="w-24 bg-white dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3 py-2 font-inter text-xs text-[#0B1F33] dark:text-white"
                      />
                    </View>

                    {/* Instructions */}
                    <TextInput
                      value={med.instructions}
                      onChangeText={(val) => handleUpdateMed(idx, 'instructions', val)}
                      placeholder="Instructions (e.g. Take with warm water after food)"
                      placeholderTextColor="#94A3B8"
                      className="bg-white dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3 py-2 font-inter text-xs text-[#0B1F33] dark:text-white"
                    />
                  </Card>
                ))}
              </View>

              {/* Doctor's Advice & Clinical Notes */}
              <View className="space-y-1">
                <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                  Doctor Advice, Dietary Notes &amp; Follow-up
                </Text>
                <TextInput
                  value={clinicalNotes}
                  onChangeText={setClinicalNotes}
                  placeholder="Drink plenty of fluids, rest adequately. Follow up after 5 days if fever persists."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3.5 py-2.5 font-inter text-xs text-[#0B1F33] dark:text-white min-h-[60px]"
                />
              </View>

              {/* Submit CTA */}
              <Button
                title={isIssuingRx ? 'Signing with Digital Key...' : 'Digitally Sign & Issue E-Prescription'}
                isLoading={isIssuingRx}
                disabled={isIssuingRx}
                onPress={handleIssuePrescription}
                className="mt-2"
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
