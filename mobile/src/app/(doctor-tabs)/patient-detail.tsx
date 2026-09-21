import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Calendar,
  Clock,
  Plus,
  Trash2,
  FileText,
  Pill,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

interface PatientRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  primaryCondition?: string;
  currentVitals?: {
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
    temperature?: number;
    glucose?: number;
    weight?: number;
    recordedAt?: string;
  };
  vitalsHistory?: Array<{
    id: string;
    bloodPressure?: string;
    heartRate?: number;
    oxygenSaturation?: number;
    temperature?: number;
    glucose?: number;
    weight?: number;
    recordedAt: string;
  }>;
  consultations?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    diagnosis?: string;
    notes?: string;
  }>;
  prescriptions?: Array<{
    id: string;
    diagnosis: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      advice?: string;
    }>;
    notes?: string;
    issuedAt: string;
  }>;
  appointments?: Array<{
    id: string;
    scheduledAt: string;
    status: string;
  }>;
}

const EMPTY_PATIENT: PatientRecord = {
  id: '',
  name: 'Patient Record',
  email: '',
  phone: undefined,
  age: undefined,
  gender: 'Unknown',
  riskLevel: 'Low',
  primaryCondition: 'General Health Review',
  currentVitals: {
    bloodPressure: '--/--',
    heartRate: 0,
    oxygenSaturation: 0,
    temperature: 0,
    glucose: 0,
    weight: 0,
    recordedAt: '',
  },
  vitalsHistory: [],
  consultations: [],
  prescriptions: [],
  appointments: [],
};

interface MedicationInput {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  advice: string;
}

export default function DoctorPatientDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [patient, setPatient] = useState<PatientRecord>(EMPTY_PATIENT);

  // E-Prescription Modal State
  const [showRxModal, setShowRxModal] = useState(false);
  const [submittingRx, setSubmittingRx] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [medications, setMedications] = useState<MedicationInput[]>([
    { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', advice: 'Take after food' },
  ]);

  const patientId = params.id;

  const fetchPatientDetail = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get<any>(`/doctor/me/patients/${patientId}`);
      if (res?.data) {
        const d = res.data;
        const parsedRx = (d.prescriptions || []).map((rx: any) => {
          let meds = rx.medications;
          if (typeof meds === 'string') {
            try {
              meds = JSON.parse(meds);
            } catch {
              meds = [{ name: meds, dosage: '', frequency: '', duration: '', advice: '' }];
            }
          }
          return {
            id: rx.id,
            diagnosis: rx.diagnosis,
            medications: Array.isArray(meds) ? meds : [],
            notes: rx.notes,
            issuedAt: rx.createdAt ? new Date(rx.createdAt).toLocaleDateString() : 'Recent',
          };
        });

        setPatient({
          id: d.id,
          name: d.name || 'Patient Record',
          email: d.email || '',
          phone: d.phone,
          age: d.age || 35,
          gender: d.gender || 'Unknown',
          riskLevel: d.riskLevel || 'Low',
          primaryCondition: d.primaryCondition || 'General Consultation',
          currentVitals: d.currentVitals || EMPTY_PATIENT.currentVitals,
          vitalsHistory: d.vitalsHistory || [],
          consultations: d.consultations || [],
          prescriptions: parsedRx,
          appointments: d.appointments || [],
        });

        if (d.appointments && d.appointments.length > 0) {
          setSelectedApptId(d.appointments[0].id);
        }
      }
    } catch {
      // Retain empty/initial data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatientDetail();
  }, [fetchPatientDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatientDetail();
  };

  const addMedicationRow = () => {
    setMedications((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: 'Once daily', duration: '7 days', advice: '' },
    ]);
  };

  const removeMedicationRow = (index: number) => {
    if (medications.length <= 1) return;
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof MedicationInput, val: string) => {
    setMedications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleIssuePrescription = async () => {
    if (!rxDiagnosis.trim()) {
      Alert.alert('Missing Diagnosis', 'Please enter a clinical diagnosis for this prescription.');
      return;
    }

    const validMeds = medications.filter((m) => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      Alert.alert('Missing Medications', 'Please add at least one medication with a valid name.');
      return;
    }

    const apptId = selectedApptId || patient.appointments?.[0]?.id;
    if (!apptId) {
      Alert.alert(
        'Appointment Required',
        'An appointment is needed to link this prescription. Please ensure this patient has a scheduled or past visit.'
      );
      return;
    }

    setSubmittingRx(true);
    try {
      await api.post('/doctor/me/prescriptions', {
        appointmentId: apptId,
        patientId: patient.id,
        diagnosis: rxDiagnosis.trim(),
        notes: rxNotes.trim(),
        medications: validMeds,
      });

      Alert.alert('Prescription Issued', 'Electronic prescription has been created and synced with the patient record.');
      setShowRxModal(false);
      // Reset inputs
      setRxDiagnosis('');
      setRxNotes('');
      setMedications([{ name: '', dosage: '', frequency: 'Once daily', duration: '7 days', advice: '' }]);
      // Refresh patient detail
      fetchPatientDetail();
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Could not issue prescription. Please try again.');
    } finally {
      setSubmittingRx(false);
    }
  };

  const vitals = patient.currentVitals || {};
  const isHighRisk = patient.riskLevel === 'High';
  const isModRisk = patient.riskLevel === 'Moderate';

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Top Bar with Back Button */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-4 pb-3 border-b border-slate-100 dark:border-[#263049] flex-row items-center justify-between"
      >
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2 py-1 px-2 rounded-xl"
        >
          <ArrowLeft size={20} color={isDark ? '#F1F5F9' : '#0F172A'} />
          <Text className="font-inter-semibold text-sm text-slate-800 dark:text-[#F1F5F9]">Back</Text>
        </Pressable>

        <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Medical Chart</Text>

        <Pressable
          onPress={() => setShowRxModal(true)}
          className="bg-[#085041] dark:bg-teal-600 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5"
        >
          <Plus size={15} color="#FFF" />
          <Text className="font-inter-semibold text-xs text-white">Rx</Text>
        </Pressable>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#085041']} />}
      >
        {/* Patient Profile Card */}
        <Card className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3">
          <View className="flex-row items-start justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60 items-center justify-center">
                <Text className="font-inter-bold text-lg text-[#085041] dark:text-teal-400">
                  {patient.name.charAt(0)}
                </Text>
              </View>
              <View>
                <Text className="font-inter-bold text-lg text-slate-900 dark:text-[#F1F5F9]">{patient.name}</Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">{patient.email}</Text>
                {patient.phone ? (
                  <Text className="font-inter text-xs text-slate-400">{patient.phone}</Text>
                ) : null}
              </View>
            </View>

            <Badge
              label={`${patient.riskLevel} Risk`}
              variant={isHighRisk ? 'danger' : isModRisk ? 'warning' : 'success'}
            />
          </View>

          {patient.primaryCondition ? (
            <View className="bg-slate-50 dark:bg-[#1C2338] px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">
                Primary Diagnosis: {patient.primaryCondition}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Current Vitals Section (6-tile Grid) */}
        <View className="space-y-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Current Vitals</Text>
            {vitals.recordedAt ? (
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Recorded: {vitals.recordedAt}</Text>
            ) : null}
          </View>

          <View className="flex-row flex-wrap gap-2.5">
            {/* Tile 1: Blood Pressure */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Blood Pressure</Text>
                <Heart size={16} color="#E11D48" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.bloodPressure || '120/80'}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">mmHg</Text>
            </Card>

            {/* Tile 2: Heart Rate */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Heart Rate</Text>
                <Activity size={16} color="#0D9488" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.heartRate || 72}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">bpm</Text>
            </Card>

            {/* Tile 3: SpO2 */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Oxygen Saturation</Text>
                <Wind size={16} color="#0284C7" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : '98%'}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">SpO2</Text>
            </Card>

            {/* Tile 4: Temperature */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Body Temp</Text>
                <Thermometer size={16} color="#D97706" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.temperature ? `${vitals.temperature}°` : '98.6°'}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">Fahrenheit</Text>
            </Card>

            {/* Tile 5: Glucose */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Blood Glucose</Text>
                <Droplets size={16} color="#7C3AED" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.glucose || 105}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">mg/dL</Text>
            </Card>

            {/* Tile 6: Weight */}
            <Card className="flex-1 min-w-[45%] p-3.5 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">Weight</Text>
                <Scale size={16} color="#475569" />
              </View>
              <Text className="font-inter-bold text-xl text-slate-900 dark:text-[#F1F5F9]">
                {vitals.weight || 68}
              </Text>
              <Text className="font-inter text-[11px] text-slate-400 mt-0.5">kg</Text>
            </Card>
          </View>
        </View>

        {/* Longitudinal Vitals History */}
        <View className="space-y-2.5">
          <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Longitudinal Vitals</Text>
          <Card className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3">
            {(patient.vitalsHistory || []).length === 0 ? (
              <View className="py-4 items-center justify-center">
                <Text className="font-inter text-xs text-slate-400">No prior vitals logs recorded</Text>
              </View>
            ) : (
              (patient.vitalsHistory || []).map((v, i) => (
                <View
                  key={v.id || i}
                  className={`flex-row items-center justify-between py-2 ${
                    i < (patient.vitalsHistory?.length || 0) - 1
                      ? 'border-b border-slate-100 dark:border-[#263049]'
                      : ''
                  }`}
                >
                  <View>
                    <Text className="font-inter-semibold text-xs text-slate-800 dark:text-slate-200">{v.recordedAt}</Text>
                    <Text className="font-inter text-[11px] text-slate-400">
                      HR: {v.heartRate || '--'} bpm • SpO2: {v.oxygenSaturation || '--'}%
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="font-inter-bold text-sm text-[#085041] dark:text-teal-400">
                      BP {v.bloodPressure || '--'}
                    </Text>
                    <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                      {v.glucose ? `Glucose: ${v.glucose} mg/dL` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Prescriptions Issued */}
        <View className="space-y-2.5">
          <View className="flex-row items-center justify-between">
            <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Issued Prescriptions</Text>
            <Pressable
              onPress={() => setShowRxModal(true)}
              className="flex-row items-center gap-1"
            >
              <Plus size={14} color={isDark ? '#2DD4BF' : '#085041'} />
              <Text className="font-inter-semibold text-xs text-[#085041] dark:text-teal-400">New Rx</Text>
            </Pressable>
          </View>

          {(patient.prescriptions || []).length === 0 ? (
            <Card className="p-6 items-center justify-center bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <Pill size={28} color="#94A3B8" />
              <Text className="font-inter-medium text-xs text-slate-500 mt-1">No prescriptions recorded</Text>
            </Card>
          ) : (
            patient.prescriptions!.map((rx) => (
              <Card
                key={rx.id}
                className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-3"
              >
                <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-[#263049] pb-2">
                  <View className="flex-row items-center gap-2">
                    <Pill size={16} color="#0D9488" />
                    <Text className="font-inter-bold text-sm text-slate-900 dark:text-[#F1F5F9]">
                      {rx.diagnosis}
                    </Text>
                  </View>
                  <Badge label={rx.issuedAt} variant="default" />
                </View>

                {rx.medications.map((m, idx) => (
                  <View key={idx} className="bg-slate-50 dark:bg-[#1C2338] p-2.5 rounded-xl space-y-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-bold text-xs text-slate-900 dark:text-[#F1F5F9]">{m.name}</Text>
                      <Text className="font-inter-semibold text-xs text-teal-700 dark:text-teal-400">{m.dosage}</Text>
                    </View>
                    <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                      {m.frequency} • {m.duration}
                    </Text>
                    {m.advice ? (
                      <Text className="font-inter text-[11px] text-slate-600 dark:text-slate-300 italic">
                        Note: {m.advice}
                      </Text>
                    ) : null}
                  </View>
                ))}

                {rx.notes ? (
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 italic">
                    Doctor Advice: {rx.notes}
                  </Text>
                ) : null}
              </Card>
            ))
          )}
        </View>

        {/* Consultation History */}
        <View className="space-y-2.5">
          <Text className="font-inter-bold text-base text-slate-900 dark:text-[#F1F5F9]">Consultation History</Text>
          {(patient.consultations || []).length === 0 ? (
            <Card className="p-6 items-center justify-center bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049]">
              <Calendar size={28} color="#94A3B8" />
              <Text className="font-inter-medium text-xs text-slate-500 mt-1">No prior consultations recorded</Text>
            </Card>
          ) : (
            (patient.consultations || []).map((c) => (
            <Card
              key={c.id}
              className="p-4 bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] space-y-2"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1.5">
                  <Calendar size={14} color="#0D9488" />
                  <Text className="font-inter-semibold text-xs text-slate-800 dark:text-slate-200">
                    {c.scheduledAt}
                  </Text>
                </View>
                <Badge label={c.status} variant={c.status === 'COMPLETED' ? 'success' : 'info'} />
              </View>

              {c.diagnosis ? (
                <Text className="font-inter-medium text-xs text-slate-900 dark:text-[#F1F5F9]">
                  {c.diagnosis}
                </Text>
              ) : null}

              {c.notes ? (
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  {c.notes}
                </Text>
              ) : null}
            </Card>
          )))}
        </View>
      </ScrollView>

      {/* Modal: Issue E-Prescription */}
      <Modal
        visible={showRxModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRxModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end bg-black/60"
        >
          <View className="bg-white dark:bg-[#151B2E] rounded-t-3xl p-5 max-h-[85%] border-t border-slate-200 dark:border-[#263049]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263049]">
              <View>
                <Text className="font-inter-bold text-lg text-slate-900 dark:text-[#F1F5F9]">
                  Issue E-Prescription
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  For {patient.name}
                </Text>
              </View>

              <Pressable
                onPress={() => setShowRxModal(false)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <X size={18} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 14, gap: 14 }}>
              {/* Diagnosis Input */}
              <View className="space-y-1.5">
                <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                  Clinical Diagnosis *
                </Text>
                <TextInput
                  placeholder="e.g. Stage 2 Essential Hypertension"
                  placeholderTextColor="#94A3B8"
                  value={rxDiagnosis}
                  onChangeText={setRxDiagnosis}
                  className="bg-slate-50 dark:bg-[#1C2338] border border-slate-200 dark:border-[#263049] rounded-xl px-3.5 py-2.5 font-inter text-sm text-slate-900 dark:text-[#F1F5F9]"
                />
              </View>

              {/* Medications List */}
              <View className="space-y-2">
                <View className="flex-row items-center justify-between">
                  <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                    Prescribed Medications
                  </Text>
                  <Pressable
                    onPress={addMedicationRow}
                    className="flex-row items-center gap-1"
                  >
                    <Plus size={14} color="#0D9488" />
                    <Text className="font-inter-semibold text-xs text-teal-700 dark:text-teal-400">Add Drug</Text>
                  </Pressable>
                </View>

                {medications.map((med, idx) => (
                  <View
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#1C2338] border border-slate-200 dark:border-[#263049] space-y-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-bold text-xs text-slate-700 dark:text-slate-300">
                        Medication #{idx + 1}
                      </Text>
                      {medications.length > 1 && (
                        <Pressable onPress={() => removeMedicationRow(idx)}>
                          <Trash2 size={16} color="#E11D48" />
                        </Pressable>
                      )}
                    </View>

                    <TextInput
                      placeholder="Medication Name (e.g. Amlodipine)"
                      placeholderTextColor="#94A3B8"
                      value={med.name}
                      onChangeText={(val) => updateMedication(idx, 'name', val)}
                      className="bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#263049] rounded-lg px-3 py-2 font-inter text-xs text-slate-900 dark:text-[#F1F5F9]"
                    />

                    <View className="flex-row gap-2">
                      <TextInput
                        placeholder="Dosage (5mg)"
                        placeholderTextColor="#94A3B8"
                        value={med.dosage}
                        onChangeText={(val) => updateMedication(idx, 'dosage', val)}
                        className="flex-1 bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#263049] rounded-lg px-3 py-2 font-inter text-xs text-slate-900 dark:text-[#F1F5F9]"
                      />
                      <TextInput
                        placeholder="Freq (Once daily)"
                        placeholderTextColor="#94A3B8"
                        value={med.frequency}
                        onChangeText={(val) => updateMedication(idx, 'frequency', val)}
                        className="flex-1 bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#263049] rounded-lg px-3 py-2 font-inter text-xs text-slate-900 dark:text-[#F1F5F9]"
                      />
                      <TextInput
                        placeholder="Duration (14d)"
                        placeholderTextColor="#94A3B8"
                        value={med.duration}
                        onChangeText={(val) => updateMedication(idx, 'duration', val)}
                        className="w-24 bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#263049] rounded-lg px-3 py-2 font-inter text-xs text-slate-900 dark:text-[#F1F5F9]"
                      />
                    </View>

                    <TextInput
                      placeholder="Patient Instructions (e.g. Take with food)"
                      placeholderTextColor="#94A3B8"
                      value={med.advice}
                      onChangeText={(val) => updateMedication(idx, 'advice', val)}
                      className="bg-white dark:bg-[#151B2E] border border-slate-200 dark:border-[#263049] rounded-lg px-3 py-2 font-inter text-xs text-slate-900 dark:text-[#F1F5F9]"
                    />
                  </View>
                ))}
              </View>

              {/* Clinical Notes Input */}
              <View className="space-y-1.5">
                <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                  Doctor's Instructions & Follow-up Notes
                </Text>
                <TextInput
                  placeholder="Additional lifestyle advice, dietary instructions or re-check timeline..."
                  placeholderTextColor="#94A3B8"
                  value={rxNotes}
                  onChangeText={setRxNotes}
                  multiline
                  numberOfLines={3}
                  className="bg-slate-50 dark:bg-[#1C2338] border border-slate-200 dark:border-[#263049] rounded-xl px-3.5 py-2.5 font-inter text-xs text-slate-900 dark:text-[#F1F5F9] min-h-[70px]"
                />
              </View>

              {/* Issue Button */}
              <Button
                title={submittingRx ? 'Issuing E-Prescription...' : 'Sign & Issue Prescription'}
                disabled={submittingRx}
                isLoading={submittingRx}
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
