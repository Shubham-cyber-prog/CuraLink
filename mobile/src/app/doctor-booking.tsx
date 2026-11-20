
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Star,
  CheckCircle2,
  Stethoscope,
  Video,
  Building2,
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  Lock,
  FileText,
  Check,
  Search,
  X,
  MapPin,
} from 'lucide-react-native';
import { Card } from '../components/UI';
import { Button } from '../components/Button';
import { MotionView, MotionPressable } from '../components/Motion';
import { ScreenHeader } from '../components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

interface BookingDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  fee: number;
  hospitalName?: string;
  clinicAddress?: string;
}

const ALL_TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
  '08:00 PM',
];

const UPI_APPS = [
  { label: 'Google Pay', handle: 'gpay@okaxis' },
  { label: 'PhonePe', handle: 'phonepe@ybl' },
  { label: 'Paytm', handle: 'paytm@paytm' },
  { label: 'BHIM UPI', handle: 'bhim@upi' },
];

const POPULAR_BANKS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India (SBI)',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
];

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING';

function parseSlotToTodayMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function getCurrentISTMinutes(): number {
  // Current time in IST (UTC + 5:30)
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600000);
  return istDate.getHours() * 60 + istDate.getMinutes();
}

export default function DoctorBookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    doctorId?: string;
    name?: string;
    specialty?: string;
    fee?: string;
    rating?: string;
    reviewCount?: string;
    hospitalName?: string;
    clinicAddress?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [selectedDoctor, setSelectedDoctor] = useState<BookingDoctor | null>(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationMode, setConsultationMode] = useState<'VIDEO' | 'IN_PERSON'>('VIDEO');
  const [patientNote, setPatientNote] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('subham@okaxis');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isBooking, setIsBooking] = useState(false);
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [doctorList, setDoctorList] = useState<BookingDoctor[]>([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Generate 5 days starting from today in IST
  const upcomingDates = useMemo(() => {
    const days: Array<{ iso: string; dayLabel: string; numLabel: string; fullLabel: string; isToday: boolean }> = [];
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istNow = new Date(utc + 5.5 * 3600000);

    for (let i = 0; i < 5; i++) {
      const d = new Date(istNow);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      days.push({
        iso,
        dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        numLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        fullLabel: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Filter valid slots: If Today, exclude time slots already passed in IST (+ 15 min buffer)
  const availableSlots = useMemo(() => {
    const isToday = upcomingDates[selectedDateIdx]?.isToday;
    if (!isToday) {
      return ALL_TIME_SLOTS;
    }
    const currentMin = getCurrentISTMinutes() + 15;
    const valid = ALL_TIME_SLOTS.filter((slot) => parseSlotToTodayMinutes(slot) > currentMin);
    return valid.length > 0 ? valid : [];
  }, [selectedDateIdx, upcomingDates]);

  // Auto-switch to tomorrow if today has no remaining slots
  useEffect(() => {
    if (upcomingDates[0]?.isToday) {
      const currentMin = getCurrentISTMinutes() + 15;
      const validToday = ALL_TIME_SLOTS.filter((slot) => parseSlotToTodayMinutes(slot) > currentMin);
      if (validToday.length === 0 && selectedDateIdx === 0) {
        setSelectedDateIdx(1); // Default to tomorrow
      }
    }
  }, [upcomingDates, selectedDateIdx]);

  // Keep selectedTime pointing to a valid slot
  useEffect(() => {
    if (availableSlots.length > 0) {
      if (!selectedTime || !availableSlots.includes(selectedTime)) {
        setSelectedTime(availableSlots[0]);
      }
    } else {
      setSelectedTime(null);
    }
  }, [availableSlots, selectedTime]);

  // Auto-select doctor from URL params if provided
  useEffect(() => {
    if (params.doctorId && params.name) {
      setSelectedDoctor({
        id: params.doctorId,
        name: params.name,
        specialty: params.specialty || 'General Practice',
        fee: params.fee ? parseInt(params.fee, 10) : 500,
        rating: params.rating ? parseFloat(params.rating) : 4.9,
        reviews: params.reviewCount ? parseInt(params.reviewCount, 10) : 0,
        hospitalName: params.hospitalName || 'Apollo City Hospital & OPD Wing',
        clinicAddress: params.clinicAddress || 'OPD Block B, Counter 2 · Sector 14',
      });
    }
  }, [params.doctorId, params.name, params.specialty, params.fee, params.rating, params.reviewCount, params.hospitalName, params.clinicAddress]);

  useEffect(() => {
    async function fetchVerifiedDoctors() {
      setLoadingDoctors(true);
      try {
        const res = await api.get<any[]>('/doctors');
        if (res.data && Array.isArray(res.data)) {
          const mapped: BookingDoctor[] = res.data.map((d: any) => {
            const rawName = d.name || 'Specialist';
            return {
              id: d.id || d.userId,
              name: rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`,
              specialty: d.specialization || d.specialty || 'General Practice',
              rating: typeof d.rating === 'number' && d.rating > 0 ? d.rating : 4.9,
              reviews: typeof d.reviewCount === 'number' ? d.reviewCount : 0,
              fee: d.consultationFee || 500,
              hospitalName: d.hospitalName || d.hospital || (d.city ? `City Multi-Specialty Hospital, ${d.city}` : 'Apollo City Hospital & OPD Wing'),
              clinicAddress: d.clinicAddress || (d.city ? `OPD Block B, Sector 14, ${d.city}` : 'OPD Block B, Counter 2 · Sector 14'),
            };
          });
          setDoctorList(mapped);
        }
      } catch (err) {
        console.error('Failed to load doctors for booking:', err);
      } finally {
        setLoadingDoctors(false);
      }
    }

    fetchVerifiedDoctors();
  }, []);

  const handleBookAndPay = async () => {
    if (!selectedDoctor || !selectedTime) {
      Alert.alert('Select a Slot', 'Please choose an available appointment date and time slot.');
      return;
    }

    // Validate payment inputs
    if (paymentMethod === 'UPI' && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID (e.g., yourname@okaxis or 9876543210@ybl).');
      return;
    }

    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 12) {
        Alert.alert('Invalid Card', 'Please enter a valid card number.');
        return;
      }
      if (!cardHolder.trim()) {
        Alert.alert('Cardholder Name', 'Please enter the name on your card.');
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        Alert.alert('Invalid Expiry', 'Enter card expiry in MM/YY format.');
        return;
      }
      if (cardCvv.replace(/\D/g, '').length < 3) {
        Alert.alert('Invalid CVV', 'Enter the 3-digit security code (CVV).');
        return;
      }
    }

    setIsBooking(true);

    try {
      const chosenDate = upcomingDates[selectedDateIdx]?.iso || new Date().toISOString().split('T')[0];

      // 1. Create appointment in PostgreSQL
      const bookRes = await api.post<any>('/appointments/book', {
        doctorId: selectedDoctor.id,
        date: chosenDate,
        time: selectedTime,
        note: patientNote.trim() || undefined,
        type: consultationMode === 'VIDEO' ? 'VIDEO' : 'IN_PERSON',
      });

      if (!bookRes.success) {
        throw new Error(bookRes.message || 'Failed to schedule appointment');
      }

      const appointmentId = bookRes.data?.id || bookRes.data?.appointment?.id;
      if (!appointmentId) {
        throw new Error('Appointment created, but ID was not returned.');
      }

      // 2. Real Payment Checkout
      const payPayload: any = {
        appointmentId,
        method: paymentMethod,
      };
      if (paymentMethod === 'UPI') payPayload.upiId = upiId.trim();
      if (paymentMethod === 'CARD') payPayload.cardLast4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      if (paymentMethod === 'NETBANKING') payPayload.bankName = selectedBank;

      const payRes = await api.post<any>('/payments/checkout', payPayload);
      const receipt = payRes?.data?.receipt || payRes?.data?.payment;

      const isOffline = consultationMode === 'IN_PERSON';
      setReceiptData({
        receiptId: receipt?.receiptId || receipt?.id || `RCPT-${Date.now().toString().slice(-6)}`,
        appointmentId,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialty,
        amount: selectedDoctor.fee,
        method: paymentMethod,
        date: chosenDate,
        time: selectedTime,
        mode: consultationMode,
        hospitalName: selectedDoctor.hospitalName || 'Apollo Multi-Speciality Hospital',
        clinicAddress: selectedDoctor.clinicAddress || 'Hospital OPD Block, Ground Floor',
        opdToken: isOffline ? `OPD-${appointmentId.slice(-4).toUpperCase()}` : undefined,
      });

      setShowConfirmModal(true);
    } catch (err: any) {
      Alert.alert(
        'Booking Notice',
        err?.message || 'Could not complete checkout. Please choose another slot or retry.'
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleFinish = () => {
    setShowConfirmModal(false);
    router.replace('/(tabs)/appointments');
  };

  if (selectedDoctor) {
    const initial = selectedDoctor.name.replace(/^Dr\.?\s*/i, '').charAt(0).toUpperCase();
    const chosenDateObj = upcomingDates[selectedDateIdx];

    return (
      <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
        <ScreenHeader
          title="Book Consultation & Pay"
          subtitle="Instant 2-minute HD Video Connect"
          onBack={() => (params.doctorId ? router.back() : setSelectedDoctor(null))}
        />

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: Math.max(insets.bottom + 30, 48),
            gap: 18,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Doctor Info Card */}
          <MotionView delay={30}>
            <Card className="flex-row items-center gap-4 border border-[#E2E8F0] dark:border-[#163656]">
              <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#006D77] shadow-sm">
                <Text className="font-inter-bold text-2xl text-white">{initial}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white" numberOfLines={1}>
                    {selectedDoctor.name}
                  </Text>
                  <ShieldCheck size={16} color="#006D77" />
                </View>
                <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE]">
                  {selectedDoctor.specialty}
                </Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                    {selectedDoctor.rating.toFixed(1)}
                  </Text>
                  <Text className="font-inter text-xs text-slate-400">
                    ({selectedDoctor.reviews} verified reviews)
                  </Text>
                </View>
              </View>
            </Card>
          </MotionView>

          {/* 1. Consultation Mode */}
          <MotionView delay={70} className="space-y-2">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">1. Select Consultation Type</Text>
            <View className="flex-row gap-3">
              {[
                { id: 'VIDEO', label: 'HD Video Call', icon: Video, desc: 'Instant Rx via app' },
                { id: 'IN_PERSON', label: 'Clinic Visit', icon: Building2, desc: 'At doctor clinic' },
              ].map((m) => {
                const active = consultationMode === m.id;
                const Icon = m.icon;
                return (
                  <View key={m.id} className="flex-1">
                    <MotionPressable
                      onPress={() => setConsultationMode(m.id as any)}
                      className={`items-center rounded-2xl border p-3.5 ${active
                          ? 'border-[#006D77] bg-[#EAF4F5] dark:bg-[#112A44] dark:border-[#83C5BE]'
                          : 'border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33]'
                        }`}
                    >
                      <Icon size={20} color={active ? (isDark ? '#83C5BE' : '#006D77') : '#64748B'} />
                      <Text
                        className={`font-inter-bold text-xs mt-1.5 ${active ? 'text-[#006D77] dark:text-[#83C5BE]' : 'text-[#0B1F33] dark:text-slate-200'
                          }`}
                      >
                        {m.label}
                      </Text>
                      <Text className="font-inter text-[10px] text-slate-400 mt-0.5">{m.desc}</Text>
                    </MotionPressable>
                  </View>
                );
              })}
            </View>
          </MotionView>

          {/* 2. Choose Date */}
          <MotionView delay={110} className="space-y-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">2. Select Consultation Date</Text>
              <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">IST Timezone</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {upcomingDates.map((d, i) => {
                const active = selectedDateIdx === i;
                return (
                  <MotionPressable
                    key={d.iso}
                    onPress={() => setSelectedDateIdx(i)}
                    className={`w-24 items-center rounded-2xl border px-3 py-3 ${active
                        ? 'border-[#006D77] bg-[#006D77]'
                        : 'border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33]'
                      }`}
                  >
                    <Text className={`font-inter-medium text-[11px] ${active ? 'text-[#83C5BE]' : 'text-slate-400'}`}>
                      {d.dayLabel}
                    </Text>
                    <Text
                      className={`font-inter-bold text-sm mt-0.5 ${active ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                        }`}
                    >
                      {d.numLabel}
                    </Text>
                  </MotionPressable>
                );
              })}
            </ScrollView>
          </MotionView>

          {/* 3. Choose Time Slot (Filtered for today) */}
          <MotionView delay={150} className="space-y-2">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
              3. Available Time Slot ({chosenDateObj?.dayLabel})
            </Text>
            {availableSlots.length === 0 ? (
              <Card className="p-4 items-center border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                <Text className="font-inter text-xs text-amber-800 dark:text-amber-300">
                  No more slots left for today. Please select tomorrow or another upcoming date above.
                </Text>
              </Card>
            ) : (
              <View className="flex-row flex-wrap gap-2.5">
                {availableSlots.map((time) => {
                  const active = selectedTime === time;
                  return (
                    <MotionPressable
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      className={`rounded-full border px-4 py-2.5 ${active
                          ? 'border-[#006D77] bg-[#006D77]'
                          : 'border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33]'
                        }`}
                    >
                      <Text
                        className={`font-inter-semibold text-xs ${active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                          }`}
                      >
                        {time}
                      </Text>
                    </MotionPressable>
                  );
                })}
              </View>
            )}
          </MotionView>

          {/* Patient Note */}
          <MotionView delay={180} className="space-y-1.5">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
              4. Symptoms or Reason for Visit (Optional)
            </Text>
            <View className="rounded-2xl border border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33] p-3">
              <TextInput
                value={patientNote}
                onChangeText={setPatientNote}
                placeholder="e.g., Fever for 2 days, mild cough, body ache..."
                placeholderTextColor="#94A3B8"
                className="font-inter text-xs text-[#0B1F33] dark:text-white"
                multiline
                numberOfLines={2}
              />
            </View>
          </MotionView>

          {/* 5. Payment Method & Details */}
          <MotionView delay={220} className="space-y-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">5. Secure Payment Method</Text>
              <View className="flex-row items-center gap-1">
                <Lock size={12} color="#10B981" />
                <Text className="font-inter text-[11px] text-emerald-600 dark:text-emerald-400">256-bit Encrypted</Text>
              </View>
            </View>

            <View className="flex-row gap-2.5">
              {[
                { id: 'UPI', label: 'UPI (Instant)', icon: Smartphone },
                { id: 'CARD', label: 'Debit / Card', icon: CreditCard },
                { id: 'NETBANKING', label: 'Net Banking', icon: Landmark },
              ].map((pm) => {
                const active = paymentMethod === pm.id;
                const Icon = pm.icon;
                return (
                  <View key={pm.id} className="flex-1">
                    <MotionPressable
                      onPress={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`items-center justify-center gap-1.5 rounded-2xl border py-3 px-2 ${active
                          ? 'border-[#006D77] bg-[#EAF4F5] dark:bg-[#112A44] dark:border-[#83C5BE]'
                          : 'border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33]'
                        }`}
                    >
                      <Icon size={18} color={active ? (isDark ? '#83C5BE' : '#006D77') : '#64748B'} />
                      <Text
                        className={`font-inter-semibold text-xs ${active ? 'text-[#006D77] dark:text-[#83C5BE]' : 'text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        {pm.label}
                      </Text>
                    </MotionPressable>
                  </View>
                );
              })}
            </View>

            {/* UPI Option Sub-view */}
            {paymentMethod === 'UPI' && (
              <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                  Select your UPI App or enter VPA ID:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {UPI_APPS.map((app) => (
                    <TouchableOpacity
                      key={app.label}
                      onPress={() => setUpiId(app.handle)}
                      className={`rounded-full px-3 py-1.5 border ${upiId === app.handle
                          ? 'bg-[#006D77] border-[#006D77]'
                          : 'bg-[#F4F7F8] dark:bg-[#071320] border-[#E2E8F0] dark:border-[#163656]'
                        }`}
                    >
                      <Text
                        className={`font-inter-semibold text-xs ${upiId === app.handle ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                          }`}
                      >
                        {app.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="rounded-xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2.5">
                  <TextInput
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="Enter UPI ID (e.g. yourname@okaxis)"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    className="font-inter text-xs text-[#0B1F33] dark:text-white"
                  />
                </View>
              </Card>
            )}

            {/* Card Option Sub-view */}
            {paymentMethod === 'CARD' && (
              <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                <View className="rounded-xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2.5">
                  <TextInput
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(t.replace(/[^0-9]/g, '').slice(0, 16))}
                    placeholder="Card Number (16 Digits)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className="font-inter text-xs text-[#0B1F33] dark:text-white"
                  />
                </View>
                <View className="rounded-xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2.5">
                  <TextInput
                    value={cardHolder}
                    onChangeText={setCardHolder}
                    placeholder="Cardholder Full Name"
                    placeholderTextColor="#94A3B8"
                    className="font-inter text-xs text-[#0B1F33] dark:text-white"
                  />
                </View>
                <View className="flex-row gap-2.5">
                  <View className="flex-1 rounded-xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2.5">
                    <TextInput
                      value={cardExpiry}
                      onChangeText={(t) => {
                        let clean = t.replace(/[^0-9]/g, '').slice(0, 4);
                        if (clean.length > 2) clean = `${clean.slice(0, 2)}/${clean.slice(2)}`;
                        setCardExpiry(clean);
                      }}
                      placeholder="MM/YY"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={5}
                      className="font-inter text-xs text-[#0B1F33] dark:text-white text-center"
                    />
                  </View>
                  <View className="flex-1 rounded-xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2.5">
                    <TextInput
                      value={cardCvv}
                      onChangeText={(t) => setCardCvv(t.replace(/[^0-9]/g, '').slice(0, 3))}
                      placeholder="CVV"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      secureTextEntry
                      maxLength={3}
                      className="font-inter text-xs text-[#0B1F33] dark:text-white text-center"
                    />
                  </View>
                </View>
              </Card>
            )}

            {/* Net Banking Sub-view */}
            {paymentMethod === 'NETBANKING' && (
              <Card className="p-4 space-y-2.5 border border-[#E2E8F0] dark:border-[#163656]">
                <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                  Select your Bank:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {POPULAR_BANKS.map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setSelectedBank(b)}
                      className={`rounded-full px-3 py-1.5 border ${selectedBank === b
                          ? 'bg-[#006D77] border-[#006D77]'
                          : 'bg-[#F4F7F8] dark:bg-[#071320] border-[#E2E8F0] dark:border-[#163656]'
                        }`}
                    >
                      <Text
                        className={`font-inter-semibold text-xs ${selectedBank === b ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                          }`}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card>
            )}
          </MotionView>

          {/* 6. Transparent Fee Summary Breakdown */}
          <MotionView delay={260}>
            <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
              <View className="flex-row justify-between items-center">
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Doctor Consultation Fee</Text>
                <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                  ₹{selectedDoctor.fee}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  Digital E-Prescription &amp; EHR Vault
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-inter text-xs text-slate-400 line-through">₹99</Text>
                  <Text className="font-inter-bold text-xs text-emerald-600 dark:text-emerald-400">FREE</Text>
                </View>
              </View>
              <View className="h-[1px] bg-[#E2E8F0] dark:bg-[#163656]" />
              <View className="flex-row justify-between items-center pt-1">
                <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">Total Amount Payable</Text>
                <Text className="font-inter-bold text-xl text-[#006D77] dark:text-[#83C5BE]">
                  ₹{selectedDoctor.fee}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 pt-1">
                <ShieldCheck size={14} color="#10B981" />
                <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
                  100% Refundable if cancelled at least 2 hours before the call.
                </Text>
              </View>
            </Card>
          </MotionView>

          {/* Pay Button */}
          <Button
            title={isBooking ? 'Processing Payment & Booking...' : `Pay ₹${selectedDoctor.fee} & Confirm`}
            onPress={handleBookAndPay}
            disabled={!selectedTime || isBooking}
            isLoading={isBooking}
          />
        </ScrollView>

        {/* ── CLINICAL CONFIRMATION RECEIPT MODAL ── */}
        <Modal visible={showConfirmModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/70 justify-end">
            <View
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
              className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 border-t border-[#E2E8F0] dark:border-[#163656]"
            >
              <View className="items-center mb-5">
                <View className="mb-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 p-4 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={46} color="#10B981" />
                </View>
                <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                  Payment Confirmed!
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your doctor appointment has been successfully scheduled.
                </Text>
              </View>

              {/* Receipt Summary Card */}
              {receiptData && (
                <Card className="p-4 space-y-2.5 mb-5 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                  <View className="flex-row justify-between items-center pb-2 border-b border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter-semibold text-xs text-slate-500 dark:text-slate-400">
                      Receipt Ref
                    </Text>
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      #{receiptData.receiptId}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Doctor</Text>
                    <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                      {receiptData.doctorName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Consultation</Text>
                    <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      {receiptData.mode === 'VIDEO' ? 'Secure HD Video Call' : 'Clinic In-Person Visit'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Slot Scheduled</Text>
                    <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                      {chosenDateObj?.fullLabel} at {receiptData.time} IST
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">Amount Paid</Text>
                    <View className="flex-row items-center gap-1.5">
                      <View className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5">
                        <Text className="font-inter-bold text-[10px] text-emerald-700 dark:text-emerald-300">
                          PAID ({receiptData.method})
                        </Text>
                      </View>
                      <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                        ₹{receiptData.amount}
                      </Text>
                    </View>
                  </View>

                  {/* Hospital OPD Pass Details if In-Person */}
                  {receiptData.mode === 'IN_PERSON' && (
                    <View className="mt-2 pt-2 border-t border-[#E2E8F0] dark:border-[#163656] space-y-1.5">
                      <View className="flex-row items-center gap-1.5">
                        <Building2 size={13} color="#006D77" />
                        <Text className="font-inter-bold text-[11px] text-[#006D77] dark:text-[#83C5BE]">
                          Hospital OPD Walk-in Pass
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="font-inter text-[11px] text-slate-500">Hospital</Text>
                        <Text className="font-inter-semibold text-[11px] text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {receiptData.hospitalName}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="font-inter text-[11px] text-slate-500">OPD Counter</Text>
                        <Text className="font-inter-medium text-[11px] text-[#0B1F33] dark:text-white">
                          {receiptData.clinicAddress}
                        </Text>
                      </View>
                      <View className="flex-row justify-between items-center pt-1">
                        <Text className="font-inter-bold text-[11px] text-[#0B1F33] dark:text-white">OPD Token</Text>
                        <View className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5">
                          <Text className="font-inter-bold text-xs text-emerald-700 dark:text-emerald-300">
                            #{receiptData.opdToken || 'OPD-WALKIN'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </Card>
              )}

              <Text className="font-inter text-[11px] text-center text-slate-500 dark:text-slate-400 mb-4">
                ✉️ Booking confirmation &amp; receipt have been dispatched to your email.
              </Text>

              <View className="space-y-2.5">
                <Button title="View in Appointments" onPress={handleFinish} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Doctor selection screen if navigated without doctorId
  const filteredDoctorList = useMemo(() => {
    const q = doctorSearch.trim().toLowerCase();
    if (!q) return doctorList;
    return doctorList.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        (d.hospitalName || '').toLowerCase().includes(q) ||
        (d.clinicAddress || '').toLowerCase().includes(q)
    );
  }, [doctorList, doctorSearch]);

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      <ScreenHeader title="Select Verified Specialist" subtitle="Top NMC-Certified Doctors & Hospitals" />

      {/* Hospital & Doctor Search Bar */}
      <View className="px-5 pt-3 pb-1">
        <View className="flex-row items-center rounded-2xl border border-[#DCE5E9] dark:border-[#163656] bg-white dark:bg-[#0B1F33] px-3.5 py-2.5 shadow-2xs">
          <Search size={16} color={isDark ? '#83C5BE' : '#006D77'} />
          <TextInput
            value={doctorSearch}
            onChangeText={setDoctorSearch}
            placeholder="Search doctor, hospital (Apollo, Fortis, Max)..."
            placeholderTextColor="#94A3B8"
            className="flex-1 font-inter text-xs text-[#0B1F33] dark:text-white ml-2.5 py-0"
            autoCapitalize="none"
          />
          {doctorSearch.length > 0 && (
            <TouchableOpacity onPress={() => setDoctorSearch('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom + 20, 36),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loadingDoctors ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#006D77" />
            <Text className="mt-3 font-inter text-xs text-slate-500 dark:text-slate-400">
              Loading board-certified doctors...
            </Text>
          </View>
        ) : filteredDoctorList.length === 0 ? (
          <Card className="items-center py-12 space-y-2">
            <Stethoscope size={36} color="#94A3B8" />
            <Text className="font-inter-semibold text-base text-[#0B1F33] dark:text-white">
              No Doctors or Hospitals Found
            </Text>
            <Text className="font-inter text-xs text-slate-400 text-center px-4">
              Try searching by specialty (Cardiology, Dermatology) or clear search filter.
            </Text>
          </Card>
        ) : (
          filteredDoctorList.map((doctor, idx) => {
            const initial = doctor.name.replace(/^Dr\.?\s*/i, '').charAt(0).toUpperCase();
            return (
              <MotionView key={doctor.id} delay={Math.min(idx * 40, 200)}>
                <MotionPressable onPress={() => setSelectedDoctor(doctor)}>
                  <Card className="flex-row items-center gap-4 border border-[#E2E8F0] dark:border-[#163656]">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#006D77]">
                      <Text className="font-inter-bold text-lg text-white">{initial}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-2">
                          <Text className="font-inter-bold text-[#0B1F33] dark:text-white text-base" numberOfLines={1}>
                            {doctor.name}
                          </Text>
                          <Text className="font-inter-medium text-xs text-[#006D77] dark:text-[#83C5BE]">
                            {doctor.specialty}
                          </Text>
                        </View>
                        <Text className="font-inter-bold text-[#006D77] dark:text-[#83C5BE] text-base">
                          ₹{doctor.fee}
                        </Text>
                      </View>

                      {/* Hospital & Address Tag */}
                      {doctor.hospitalName && (
                        <View className="flex-row items-center gap-1 mt-0.5">
                          <Building2 size={11} color="#64748B" />
                          <Text className="font-inter-medium text-[11px] text-slate-500 dark:text-slate-400" numberOfLines={1}>
                            {doctor.hospitalName}
                          </Text>
                        </View>
                      )}

                      <View className="flex-row items-center gap-1 mt-1">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                          {doctor.rating.toFixed(1)}
                        </Text>
                        <Text className="font-inter text-[11px] text-slate-400">• Tap to book &amp; pay</Text>
                      </View>
                    </View>
                  </Card>
                </MotionPressable>
              </MotionView>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
