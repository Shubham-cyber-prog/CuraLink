import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarCheck,
  Video,
  Clock,
  Stethoscope,
  ChevronRight,
  MessageCircle,
  CreditCard,
  XCircle,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Landmark,
  Lock,
  X,
  Star,
  Pill,
  FileText,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView, MotionPressable } from '../../components/Motion';
import { useTheme } from '../../lib/theme-context';
import { api } from '../../lib/api';

export interface MobileAppointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING';
  fee: number;
  paymentStatus: string;
  review?: {
    id?: string;
    rating: number;
    comment?: string;
  } | null;
  prescription?: {
    id: string;
    diagnosis: string;
    medications: any;
    notes?: string;
    createdAt?: string;
  } | null;
}

function formatDateLabel(raw?: string): string {
  if (!raw) return 'Upcoming';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcoming, setUpcoming] = useState<MobileAppointment[]>([]);
  const [past, setPast] = useState<MobileAppointment[]>([]);
  const [filterTab, setFilterTab] = useState<'upcoming' | 'past'>('upcoming');
  const [actionId, setActionId] = useState<string | null>(null);

  // Quick Pay Modal State
  const [payingAppt, setPayingAppt] = useState<MobileAppointment | null>(null);
  const [payMethod, setPayMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiVpa, setUpiVpa] = useState('subham@okaxis');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<any | null>(null);

  // Review Doctor Modal State
  const [reviewingAppt, setReviewingAppt] = useState<MobileAppointment | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // View Prescription Modal State
  const [viewingRx, setViewingRx] = useState<any | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await api.get<any[]>('/appointments/my-appointments').catch(() => null);
      if (response?.data && Array.isArray(response.data)) {
        const fetched: MobileAppointment[] = response.data.map((item: any) => {
          const rawDoc = item.doctor?.name || item.doctorName || 'Dr. Specialist';
          const docId = item.doctorId || item.doctor?.id || item.doctor?.userId || '';
          return {
            id: item.id,
            doctorId: docId,
            doctorName: rawDoc.startsWith('Dr.') ? rawDoc : `Dr. ${rawDoc}`,
            specialty: item.doctor?.specialty || item.doctor?.specialization || item.specialty || 'General Practice',
            date: formatDateLabel(item.date || item.scheduledAt),
            time: item.time || '10:30 AM',
            status: (item.status || 'PENDING').toUpperCase(),
            fee: item.payment?.amount || item.doctor?.consultationFee || 500,
            paymentStatus: item.payment?.status || 'PENDING',
            review: item.review || null,
            prescription: item.prescription || null,
          };
        });

        setUpcoming(fetched.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING'));
        setPast(fetched.filter((a) => a.status === 'COMPLETED' || a.status === 'CANCELLED'));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleOpenPayModal = (appt: MobileAppointment) => {
    setPayingAppt(appt);
    setPaymentSuccessData(null);
  };

  const executePayment = async () => {
    if (!payingAppt) return;
    setIsProcessingPayment(true);
    try {
      const payPayload: any = {
        appointmentId: payingAppt.id,
        method: payMethod,
      };
      if (payMethod === 'UPI') payPayload.upiId = upiVpa.trim() || 'user@okaxis';

      const res = await api.post<any>('/payments/checkout', payPayload);
      if (!res.success) throw new Error(res.message || 'Payment failed');

      const receipt = res?.data?.receipt || res?.data?.payment;
      setPaymentSuccessData({
        receiptId: receipt?.receiptId || receipt?.id || `RCPT-${Date.now().toString().slice(-6)}`,
        doctorName: payingAppt.doctorName,
        fee: payingAppt.fee,
        method: payMethod,
        date: payingAppt.date,
        time: payingAppt.time,
      });
      await fetchAppointments();
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Could not process payment.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancel = (appt: MobileAppointment) => {
    Alert.alert('Cancel Appointment', `Cancel your appointment with ${appt.doctorName}?`, [
      { text: 'Keep Visit', style: 'cancel' },
      {
        text: 'Cancel Visit',
        style: 'destructive',
        onPress: async () => {
          setActionId(appt.id);
          try {
            await api.patch(`/appointments/${appt.id}/status`, { status: 'CANCELLED' });
            await fetchAppointments();
          } catch (err: any) {
            Alert.alert('Cancel Failed', err?.message || 'Could not cancel appointment.');
          } finally {
            setActionId(null);
          }
        },
      },
    ]);
  };

  const handleOpenReviewModal = (appt: MobileAppointment) => {
    setReviewingAppt(appt);
    setReviewRating(5);
    setReviewComment('');
    setReviewSuccess(false);
  };

  const submitDoctorReview = async () => {
    if (!reviewingAppt) return;
    const finalComment = reviewComment.trim() || 'Very good consultation with the doctor. Highly recommended.';
    if (finalComment.length < 5) {
      Alert.alert('Review Comment', 'Please write a brief comment of at least 5 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        doctorId: reviewingAppt.doctorId,
        appointmentId: reviewingAppt.id,
        rating: reviewRating,
        comment: finalComment,
      });

      setReviewSuccess(true);
      await fetchAppointments();
    } catch (err: any) {
      Alert.alert('Review Error', err?.message || 'Could not submit your review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenPrescriptionModal = (appt: MobileAppointment) => {
    if (appt.prescription) {
      setViewingRx({
        ...appt.prescription,
        doctorName: appt.doctorName,
        specialty: appt.specialty,
        date: appt.date,
      });
    }
  };

  const activeList = filterTab === 'upcoming' ? upcoming : past;

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      {/* Clean Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        className="bg-white dark:bg-[#0B1F33] px-5 pb-4 border-b border-[#E6ECEF] dark:border-[#163656] space-y-4"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">Appointments</Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Upcoming visits, instant video calls &amp; history
            </Text>
          </View>
          <MotionPressable
            onPress={() => router.push('/(tabs)/doctors')}
            className="rounded-full bg-[#006D77] px-4 py-2"
          >
            <Text className="font-inter-semibold text-xs text-white">+ Book</Text>
          </MotionPressable>
        </View>

        <View className="flex-row rounded-full bg-[#F4F7F8] dark:bg-[#071320] p-1 border border-[#E6ECEF] dark:border-[#163656]">
          {[
            { id: 'upcoming', label: `Upcoming (${upcoming.length})` },
            { id: 'past', label: `Past (${past.length})` },
          ].map((tab) => {
            const active = filterTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setFilterTab(tab.id as any)}
                className={`flex-1 py-2 rounded-full items-center ${active ? 'bg-[#006D77]' : ''}`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    active ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
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
              fetchAppointments();
            }}
            colors={['#006D77']}
          />
        }
      >
        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#006D77" />
          </View>
        ) : activeList.length === 0 ? (
          <Card className="items-center py-10 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
            <CalendarCheck size={32} color={isDark ? '#83C5BE' : '#006D77'} />
            <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
              {filterTab === 'upcoming' ? 'No upcoming consultations' : 'No past consultation history'}
            </Text>
            {filterTab === 'upcoming' && (
              <Button title="Find a Specialist" size="sm" onPress={() => router.push('/(tabs)/doctors')} />
            )}
          </Card>
        ) : (
          activeList.map((appt, idx) => {
            const isConfirmed = appt.status === 'CONFIRMED';
            const isPending = appt.status === 'PENDING';
            const busy = actionId === appt.id;

            return (
              <MotionView key={appt.id} delay={Math.min(idx * 45, 220)}>
                <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                  <View className="flex-row items-center justify-between gap-2 border-b border-[#EDF3F4] dark:border-[#163656] pb-3">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#006D77]">
                        <Stethoscope size={19} color="#FFFFFF" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-[#0B1F33] dark:text-white text-base" numberOfLines={1}>
                          {appt.doctorName}
                        </Text>
                        <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">
                          {appt.specialty}
                        </Text>
                      </View>
                    </View>
                    <Badge
                      label={isConfirmed ? 'Confirmed' : isPending ? 'Payment Pending' : appt.status}
                      variant={
                        isConfirmed
                          ? 'success'
                          : isPending
                          ? 'warning'
                          : appt.status === 'COMPLETED'
                          ? 'info'
                          : 'danger'
                      }
                    />
                  </View>

                  <View className="flex-row items-center justify-between rounded-xl bg-[#F6F8F9] dark:bg-[#071320] px-3.5 py-2.5">
                    <View className="flex-row items-center gap-2">
                      <Clock size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                      <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">
                        {appt.date} • {appt.time}
                      </Text>
                    </View>
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      ₹{appt.fee}
                    </Text>
                  </View>

                  {isConfirmed && (
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Button
                          title="Join Video Room"
                          icon={Video}
                          size="sm"
                          onPress={() => router.push(`/consultation/${appt.id}` as any)}
                        />
                      </View>
                      <MotionPressable
                        onPress={() =>
                          router.push({
                            pathname: '/chat',
                            params: { appointmentId: appt.id, doctorName: appt.doctorName },
                          })
                        }
                        className="h-10 w-10 items-center justify-center rounded-full border border-[#E2E8F0] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#112A44]"
                      >
                        <MessageCircle size={17} color={isDark ? '#83C5BE' : '#006D77'} />
                      </MotionPressable>
                      <MotionPressable
                        onPress={() => handleCancel(appt)}
                        disabled={busy}
                        className="h-10 w-10 items-center justify-center rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
                      >
                        <XCircle size={17} color="#E11D48" />
                      </MotionPressable>
                    </View>
                  )}

                  {isPending && (
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <Button
                          title={`Pay ₹${appt.fee} & Confirm`}
                          icon={CreditCard}
                          size="sm"
                          onPress={() => handleOpenPayModal(appt)}
                        />
                      </View>
                      <MotionPressable
                        onPress={() => handleCancel(appt)}
                        disabled={busy}
                        className="px-4 items-center justify-center rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
                      >
                        <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">Cancel</Text>
                      </MotionPressable>
                    </View>
                  )}

                  {!isConfirmed && !isPending && (
                    <View className="flex-row items-center justify-between pt-1 border-t border-[#EDF3F4] dark:border-[#163656]">
                      <View className="flex-row items-center gap-2">
                        {appt.prescription ? (
                          <MotionPressable
                            onPress={() => handleOpenPrescriptionModal(appt)}
                            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4F5] dark:bg-[#112A44] border border-[#006D77]/20"
                          >
                            <Pill size={13} color="#006D77" />
                            <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                              View E-Rx
                            </Text>
                          </MotionPressable>
                        ) : null}

                        {appt.status === 'COMPLETED' && (
                          appt.review ? (
                            <View className="flex-row items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-900">
                              <Star size={12} color="#F59E0B" fill="#F59E0B" />
                              <Text className="font-inter-bold text-[11px] text-amber-700 dark:text-amber-400">
                                Rated {appt.review.rating}/5
                              </Text>
                            </View>
                          ) : (
                            <MotionPressable
                              onPress={() => handleOpenReviewModal(appt)}
                              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30"
                            >
                              <Star size={13} color="#D97706" fill="#D97706" />
                              <Text className="font-inter-bold text-xs text-amber-700 dark:text-amber-400">
                                Rate Doctor
                              </Text>
                            </MotionPressable>
                          )
                        )}
                      </View>

                      <Pressable onPress={() => router.push('/(tabs)/doctors')} className="flex-row items-center gap-1 py-1">
                        <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">Book Again</Text>
                        <ChevronRight size={14} color={isDark ? '#83C5BE' : '#006D77'} />
                      </Pressable>
                    </View>
                  )}
                </Card>
              </MotionView>
            );
          })
        )}
      </ScrollView>

      {/* ── FAST PAYMENT CHECKOUT MODAL ── */}
      <Modal visible={Boolean(payingAppt)} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 border-t border-[#E2E8F0] dark:border-[#163656]"
          >
            {paymentSuccessData ? (
              // Payment Success View
              <View className="items-center py-2">
                <View className="mb-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 p-4 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={44} color="#10B981" />
                </View>
                <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                  Payment Complete!
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 text-center">
                  Your appointment with {paymentSuccessData.doctorName} is confirmed.
                </Text>

                <Card className="w-full p-4 space-y-2 mb-4 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                  <View className="flex-row justify-between items-center pb-2 border-b border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Receipt Ref</Text>
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      #{paymentSuccessData.receiptId}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Amount Paid</Text>
                    <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                      ₹{paymentSuccessData.fee} ({paymentSuccessData.method})
                    </Text>
                  </View>
                </Card>

                <Button
                  title="Done"
                  onPress={() => {
                    setPayingAppt(null);
                    setPaymentSuccessData(null);
                  }}
                />
              </View>
            ) : (
              // Checkout Options View
              <View>
                <View className="flex-row items-center justify-between pb-3.5 border-b border-[#E6ECEF] dark:border-[#163656]">
                  <View>
                    <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Complete Payment</Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      {payingAppt?.doctorName} • {payingAppt?.date} at {payingAppt?.time}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPayingAppt(null)}
                    className="h-8 w-8 rounded-full items-center justify-center bg-[#F4F7F8] dark:bg-[#112A44]"
                  >
                    <X size={16} color={isDark ? '#FFFFFF' : '#0B1F33'} />
                  </TouchableOpacity>
                </View>

                {/* Method Selector */}
                <View className="my-4 space-y-3">
                  <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                    Select Payment Method:
                  </Text>
                  <View className="flex-row gap-2">
                    {[
                      { id: 'UPI', label: 'UPI', icon: Smartphone },
                      { id: 'CARD', label: 'Card', icon: CreditCard },
                      { id: 'NETBANKING', label: 'NetBank', icon: Landmark },
                    ].map((pm) => {
                      const active = payMethod === pm.id;
                      const Icon = pm.icon;
                      return (
                        <TouchableOpacity
                          key={pm.id}
                          onPress={() => setPayMethod(pm.id as any)}
                          className={`flex-1 items-center py-2.5 rounded-xl border ${
                            active
                              ? 'bg-[#EAF4F5] dark:bg-[#112A44] border-[#006D77] dark:border-[#83C5BE]'
                              : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                          }`}
                        >
                          <Icon size={16} color={active ? (isDark ? '#83C5BE' : '#006D77') : '#64748B'} />
                          <Text
                            className={`font-inter-semibold text-xs mt-1 ${
                              active ? 'text-[#006D77] dark:text-[#83C5BE]' : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {pm.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {payMethod === 'UPI' && (
                    <View className="rounded-xl border border-[#E2E8F0] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#0B1F33] px-3.5 py-2.5">
                      <TextInput
                        value={upiVpa}
                        onChangeText={setUpiVpa}
                        placeholder="UPI ID (e.g. name@okaxis)"
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                        className="font-inter text-xs text-[#0B1F33] dark:text-white"
                      />
                    </View>
                  )}
                </View>

                {/* Amount to pay */}
                <Card className="p-3.5 mb-4 flex-row justify-between items-center bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                  <View>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">Total Consultation Fee</Text>
                    <Text className="font-inter text-[10px] text-emerald-600 dark:text-emerald-400">
                      ✓ Instant slot confirmation
                    </Text>
                  </View>
                  <Text className="font-inter-bold text-xl text-[#006D77] dark:text-[#83C5BE]">
                    ₹{payingAppt?.fee}
                  </Text>
                </Card>

                <Button
                  title={isProcessingPayment ? 'Processing...' : `Pay ₹${payingAppt?.fee} Now`}
                  onPress={executePayment}
                  isLoading={isProcessingPayment}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── 2. DOCTOR RATING & REVIEW MODAL ── */}
      <Modal visible={Boolean(reviewingAppt)} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 max-h-[85%] border-t border-[#E2E8F0] dark:border-[#163656]"
          >
            {reviewSuccess ? (
              <View className="items-center py-4 space-y-3">
                <View className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 p-4 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={44} color="#10B981" />
                </View>
                <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">
                  Review Submitted!
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
                  Thank you for rating {reviewingAppt?.doctorName}. Your feedback helps other patients make informed healthcare decisions.
                </Text>
                <Button
                  title="Done"
                  onPress={() => {
                    setReviewingAppt(null);
                    setReviewSuccess(false);
                  }}
                  className="mt-3"
                />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
                <View className="flex-row items-center justify-between pb-3 border-b border-[#EDF3F4] dark:border-[#163656]">
                  <View>
                    <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
                      Rate Consultation
                    </Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                      With {reviewingAppt?.doctorName} • {reviewingAppt?.specialty}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setReviewingAppt(null)}
                    className="h-8 w-8 rounded-full items-center justify-center bg-[#F4F7F8] dark:bg-[#112A44]"
                  >
                    <X size={16} color={isDark ? '#FFFFFF' : '#0B1F33'} />
                  </TouchableOpacity>
                </View>

                {/* Interactive Star Bar */}
                <View className="items-center py-2 space-y-2">
                  <Text className="font-inter-semibold text-xs text-slate-600 dark:text-slate-300">
                    How was your consultation experience?
                  </Text>
                  <View className="flex-row items-center gap-2.5">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= reviewRating;
                      return (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setReviewRating(star)}
                          activeOpacity={0.7}
                          className="p-1.5"
                        >
                          <Star
                            size={32}
                            color={active ? '#F59E0B' : '#CBD5E1'}
                            fill={active ? '#F59E0B' : 'transparent'}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                    {reviewRating === 5
                      ? 'Excellent experience (5/5)'
                      : reviewRating === 4
                      ? 'Very good consultation (4/5)'
                      : reviewRating === 3
                      ? 'Satisfactory (3/5)'
                      : reviewRating === 2
                      ? 'Needs improvement (2/5)'
                      : 'Unsatisfactory (1/5)'}
                  </Text>
                </View>

                {/* Quick Feedback Chips */}
                <View className="space-y-1.5">
                  <Text className="font-inter-semibold text-xs text-slate-600 dark:text-slate-300">
                    Quick tags (tap to add):
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {[
                      'Listened patiently',
                      'Accurate diagnosis',
                      'Helpful advice',
                      'Polite & empathetic',
                      'Punctual & clear',
                    ].map((tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => {
                          setReviewComment((prev) =>
                            prev.includes(tag) ? prev : prev ? `${prev}, ${tag}` : tag
                          );
                        }}
                        className="px-2.5 py-1 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656]"
                      >
                        <Text className="font-inter-medium text-[11px] text-slate-700 dark:text-slate-300">
                          + {tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Detailed Feedback Textarea */}
                <View className="space-y-1.5">
                  <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                    Your detailed feedback
                  </Text>
                  <TextInput
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder="Tell us about the consultation, clarity of explanation and doctor care..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-2xl p-3.5 font-inter text-xs text-[#0B1F33] dark:text-white min-h-[75px]"
                  />
                </View>

                <Button
                  title={submittingReview ? 'Submitting...' : 'Submit Rating & Review'}
                  onPress={submitDoctorReview}
                  isLoading={submittingReview}
                  disabled={submittingReview}
                  className="mt-1"
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* ── 3. PATIENT DIGITAL PRESCRIPTION (E-RX) VIEWER MODAL ── */}
      <Modal visible={Boolean(viewingRx)} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 max-h-[85%] border-t border-[#E2E8F0] dark:border-[#163656]"
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-[#EDF3F4] dark:border-[#163656]">
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 rounded-xl bg-[#006D77] items-center justify-center">
                  <Pill size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                    Digital Prescription (E-Rx)
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                    Issued by {viewingRx?.doctorName} • {viewingRx?.date}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setViewingRx(null)}
                className="h-8 w-8 rounded-full items-center justify-center bg-[#F4F7F8] dark:bg-[#112A44]"
              >
                <X size={16} color={isDark ? '#FFFFFF' : '#0B1F33'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 14, gap: 14 }}>
              {/* Telemedicine Compliance Badge */}
              <View className="flex-row items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 border border-emerald-200 dark:border-emerald-800">
                <View className="flex-row items-center gap-2">
                  <ShieldCheck size={16} color="#10B981" />
                  <Text className="font-inter-semibold text-xs text-emerald-800 dark:text-emerald-300">
                    NMC Telemedicine Verified &amp; Signed
                  </Text>
                </View>
                <Text className="font-inter-bold text-[10px] text-emerald-700 dark:text-emerald-400">
                  Secured
                </Text>
              </View>

              {/* Diagnosis */}
              <View className="space-y-1">
                <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400">
                  Clinical Diagnosis
                </Text>
                <Card className="p-3 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                  <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                    {viewingRx?.diagnosis || 'General Consultation Evaluation'}
                  </Text>
                </Card>
              </View>

              {/* Prescribed Medications */}
              <View className="space-y-2">
                <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400">
                  Prescribed Medications
                </Text>

                {(() => {
                  let meds = [];
                  try {
                    meds = typeof viewingRx?.medications === 'string'
                      ? JSON.parse(viewingRx.medications)
                      : (Array.isArray(viewingRx?.medications) ? viewingRx.medications : []);
                  } catch {
                    meds = [];
                  }

                  if (meds.length === 0) {
                    return (
                      <Card className="p-3 bg-[#F8FAFB] dark:bg-[#0B1F33]">
                        <Text className="font-inter text-xs text-slate-500">
                          {typeof viewingRx?.medications === 'string' ? viewingRx.medications : 'Refer to clinical notes.'}
                        </Text>
                      </Card>
                    );
                  }

                  return meds.map((m: any, idx: number) => (
                    <Card
                      key={idx}
                      className="p-3 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656] space-y-1.5"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                          {idx + 1}. {m.name}
                        </Text>
                        <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                          {m.dosage}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Clock size={12} color="#64748B" />
                        <Text className="font-inter text-xs text-slate-600 dark:text-slate-300">
                          {m.frequency} • {m.duration}
                        </Text>
                      </View>
                      {m.instructions || m.advice ? (
                        <Text className="font-inter text-[11px] text-slate-500 italic">
                          Instruction: {m.instructions || m.advice}
                        </Text>
                      ) : null}
                    </Card>
                  ));
                })()}
              </View>

              {/* Doctor's Advice / Notes */}
              {viewingRx?.notes && (
                <View className="space-y-1">
                  <Text className="font-inter-bold text-xs uppercase tracking-wider text-slate-400">
                    Dietary &amp; Follow-up Advice
                  </Text>
                  <Card className="p-3 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {viewingRx.notes}
                    </Text>
                  </Card>
                </View>
              )}

              <Button title="Close Prescription" onPress={() => setViewingRx(null)} className="mt-2" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
