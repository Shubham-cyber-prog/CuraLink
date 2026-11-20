import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  CreditCard,
  Smartphone,
  Calendar,
  AlertCircle,
  FileText,
  Award,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../components/UI';
import { Button } from '../components/Button';
import { MotionView, MotionPressable } from '../components/Motion';
import { useAuth } from '../lib/auth-context';
import { useTheme } from '../lib/theme-context';
import { useLocation } from '../lib/location-context';
import { api } from '../lib/api';

interface LabPackage {
  id: string;
  name: string;
  category: string;
  testCount: number;
  fastingHours: number;
  reportTurnaround: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  sampleType: string;
  description: string;
  popular?: boolean;
  testsCovered: string[];
}

interface LabBooking {
  id: string;
  userId: string;
  patientName: string;
  patientPhone: string;
  packageId: string;
  packageName: string;
  price: number;
  collectionAddress: string;
  collectionCity: string;
  collectionDate: string;
  collectionSlot: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  phlebotomistName?: string;
  phlebotomistPhone?: string;
  createdAt: string;
}

const CATEGORIES = [
  'All Packages',
  'Full Body',
  'Diabetes & Heart',
  'Vitamins & Blood',
  'Organ Care',
];

const TIME_SLOTS = [
  { id: 'slot-1', label: '06:30 AM - 07:30 AM', note: 'Best for 10-12h fasting' },
  { id: 'slot-2', label: '07:30 AM - 08:30 AM', note: 'Fasting recommended' },
  { id: 'slot-3', label: '08:30 AM - 09:30 AM', note: 'Standard morning slot' },
  { id: 'slot-4', label: '09:30 AM - 10:30 AM', note: 'Standard morning slot' },
  { id: 'slot-5', label: '05:00 PM - 06:00 PM', note: 'Evening (non-fasting tests)' },
];

export default function LabTestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { location } = useLocation();

  // Screen state
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'MY_BOOKINGS'>('PACKAGES');
  const [selectedCategory, setSelectedCategory] = useState('All Packages');
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<LabPackage[]>([]);
  const [myBookings, setMyBookings] = useState<LabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  // Booking Modal State
  const [bookingPackage, setBookingPackage] = useState<LabPackage | null>(null);
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState((user as any)?.phone || '9876543210');
  const [collectionAddress, setCollectionAddress] = useState(
    location?.fullAddress && location.fullAddress !== 'Location not set'
      ? location.fullAddress
      : `${location?.area || 'Near City Center'}, New Delhi`
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // 0: Today, 1: Tomorrow, 2: Day After
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1].label);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'PAY_ON_COLLECTION'>('UPI');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<LabBooking | null>(null);

  // Compute 3 upcoming date labels
  const dateOptions = useMemo(() => {
    return [0, 1, 2].map((offset) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return {
        key: offset,
        dayLabel: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        isoDate: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
      };
    });
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [pkgRes, bookingsRes] = await Promise.all([
        api.get<LabPackage[]>('/lab/packages').catch(() => null),
        api.get<LabBooking[]>('/lab/my-bookings').catch(() => null),
      ]);

      if (pkgRes?.data && Array.isArray(pkgRes.data)) {
        setPackages(pkgRes.data);
      }
      if (bookingsRes?.data && Array.isArray(bookingsRes.data)) {
        setMyBookings(bookingsRes.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync patient info from user profile
  useEffect(() => {
    if (user?.name) setPatientName(user.name);
    if ((user as any)?.phone) setPatientPhone((user as any).phone);
    if (location?.fullAddress && location.fullAddress !== 'Location not set') {
      setCollectionAddress(location.fullAddress);
    }
  }, [user, location]);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesCat =
        selectedCategory === 'All Packages' ||
        pkg.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.testsCovered.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [packages, selectedCategory, searchQuery]);

  const handleOpenBooking = (pkg: LabPackage) => {
    setBookingPackage(pkg);
    setBookingSuccessData(null);
  };

  const handleExecuteBooking = async () => {
    if (!bookingPackage) return;
    if (!patientName.trim()) {
      Alert.alert('Missing Name', 'Please enter the patient name for the lab report.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit mobile number for phlebotomist communication.');
      return;
    }
    if (!collectionAddress.trim() || collectionAddress.trim().length < 6) {
      Alert.alert('Missing Address', 'Please provide a clear doorstep sample collection address.');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const dateSelected = dateOptions[selectedDateIndex].isoDate;
      const res = await api.post<LabBooking>('/lab/book', {
        packageId: bookingPackage.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        collectionAddress: collectionAddress.trim(),
        collectionCity: location?.area || 'Delhi NCR',
        collectionDate: dateSelected,
        collectionSlot: selectedSlot,
        paymentMethod,
      });

      if (res?.data) {
        setBookingSuccessData(res.data);
        await loadData();
      } else {
        throw new Error(res?.message || 'Could not schedule home collection.');
      }
    } catch (err: any) {
      Alert.alert('Booking Error', err?.message || 'Failed to schedule sample collection.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert('Cancel Sample Pickup', 'Are you sure you want to cancel this scheduled home sample collection?', [
      { text: 'Keep Slot', style: 'cancel' },
      {
        text: 'Cancel Pickup',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/lab/bookings/${bookingId}`);
            await loadData();
          } catch (err: any) {
            Alert.alert('Cancellation Error', err?.message || 'Could not cancel booking.');
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      {/* ── TOP APP BAR ── */}
      <View
        style={{ paddingTop: Math.max(insets.top + 6, 16) }}
        className="bg-white dark:bg-[#0B1F33] px-5 pb-4 border-b border-[#E6ECEF] dark:border-[#163656] space-y-3"
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-2xl bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656]"
          >
            <ArrowLeft size={19} color={isDark ? '#F1F5F9' : '#0B1F33'} />
          </Pressable>

          <View className="items-center">
            <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">
              Diagnostics at Home
            </Text>
            <View className="flex-row items-center gap-1">
              <Award size={12} color="#006D77" />
              <Text className="font-inter text-[11px] text-[#006D77] dark:text-[#83C5BE]">
                NABL &amp; ICMR Certified Labs
              </Text>
            </View>
          </View>

          <MotionPressable
            onPress={() => setActiveTab(activeTab === 'PACKAGES' ? 'MY_BOOKINGS' : 'PACKAGES')}
            className={`px-3 py-1.5 rounded-full border ${
              activeTab === 'MY_BOOKINGS'
                ? 'bg-[#006D77] border-[#006D77]'
                : 'bg-[#EAF4F5] dark:bg-[#112A44] border-[#C7E3E5] dark:border-[#163656]'
            }`}
          >
            <Text
              className={`font-inter-bold text-[11px] ${
                activeTab === 'MY_BOOKINGS' ? 'text-white' : 'text-[#006D77] dark:text-[#83C5BE]'
              }`}
            >
              {activeTab === 'MY_BOOKINGS' ? 'All Tests' : `My Orders (${myBookings.length})`}
            </Text>
          </MotionPressable>
        </View>

        {/* Tab Toggle */}
        <View className="flex-row rounded-full bg-[#F4F7F8] dark:bg-[#071320] p-1 border border-[#E6ECEF] dark:border-[#163656]">
          <Pressable
            onPress={() => setActiveTab('PACKAGES')}
            className={`flex-1 py-2 rounded-full items-center ${activeTab === 'PACKAGES' ? 'bg-[#006D77]' : ''}`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                activeTab === 'PACKAGES' ? 'text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Diagnostic Packages ({packages.length})
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('MY_BOOKINGS')}
            className={`flex-1 py-2 rounded-full items-center ${activeTab === 'MY_BOOKINGS' ? 'bg-[#006D77]' : ''}`}
          >
            <Text
              className={`font-inter-semibold text-xs ${
                activeTab === 'MY_BOOKINGS' ? 'text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              My Bookings ({myBookings.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 90, 100),
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={['#006D77']}
          />
        }
      >
        {activeTab === 'PACKAGES' ? (
          <>
            {/* Free Home Pickup Trust Banner */}
            <View className="rounded-3xl bg-[#006D77] p-4 shadow-sm overflow-hidden relative">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full">
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text className="font-inter-bold text-[10px] text-white uppercase tracking-wider">
                    Zero Visit Fee
                  </Text>
                </View>
                <Text className="font-inter-semibold text-[11px] text-[#83C5BE]">
                  100% Free Doorstep Collection
                </Text>
              </View>
              <Text className="font-inter-bold text-lg text-white mb-1">
                Certified Phlebotomist at Your Door
              </Text>
              <Text className="font-inter text-xs text-white/80 leading-relaxed">
                Painless sample collection with single-use sterile vacuum tubes. Reports verified by MD Pathologists delivered directly to your app.
              </Text>
            </View>

            {/* Search Input */}
            <View className="flex-row items-center gap-2 rounded-2xl bg-white dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656] px-3.5 py-2.5">
              <Search size={16} color="#006D77" />
              <TextInput
                placeholder="Search test name (e.g. CBC, Lipid, HbA1c, Vitamin D)..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 font-inter text-xs text-[#0B1F33] dark:text-white"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <X size={15} color="#94A3B8" />
                </Pressable>
              )}
            </View>

            {/* Category Filter Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-full border ${
                      active
                        ? 'bg-[#006D77] border-[#006D77]'
                        : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                    }`}
                  >
                    <Text
                      className={`font-inter-semibold text-xs ${
                        active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Packages List */}
            {loading ? (
              <View className="py-16 items-center">
                <ActivityIndicator size="large" color="#006D77" />
              </View>
            ) : filteredPackages.length === 0 ? (
              <Card className="items-center py-10 space-y-2 border border-[#E2E8F0] dark:border-[#163656]">
                <Activity size={32} color="#006D77" />
                <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                  No packages found
                </Text>
                <Text className="font-inter text-xs text-slate-500 text-center">
                  Try another search query or choose All Packages.
                </Text>
              </Card>
            ) : (
              filteredPackages.map((pkg, idx) => {
                const isExpanded = expandedPackageId === pkg.id;
                return (
                  <MotionView key={pkg.id} delay={Math.min(idx * 40, 200)}>
                    <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                      {/* Top Badges */}
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1.5">
                          {pkg.popular && (
                            <View className="rounded-full bg-amber-500/15 px-2 py-0.5 border border-amber-500/30">
                              <Text className="font-inter-bold text-[10px] text-amber-600 dark:text-amber-400">
                                ★ MOST POPULAR
                              </Text>
                            </View>
                          )}
                          <View className="rounded-full bg-[#EAF4F5] dark:bg-[#112A44] px-2.5 py-0.5">
                            <Text className="font-inter-bold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                              {pkg.testCount} Tests Included
                            </Text>
                          </View>
                        </View>
                        <Text className="font-inter-bold text-[10px] text-emerald-600 dark:text-emerald-400">
                          {pkg.discountPercent}% OFF
                        </Text>
                      </View>

                      {/* Package Name & Description */}
                      <View>
                        <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                          {pkg.name}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {pkg.description}
                        </Text>
                      </View>

                      {/* Key Protocol Specs */}
                      <View className="flex-row items-center gap-3 bg-[#F6F8F9] dark:bg-[#071320] px-3 py-2 rounded-xl">
                        <View className="flex-row items-center gap-1.5">
                          <Clock size={13} color="#006D77" />
                          <Text className="font-inter-medium text-[11px] text-slate-700 dark:text-slate-300">
                            {pkg.fastingHours > 0 ? `${pkg.fastingHours}h Fasting` : 'No Fasting'}
                          </Text>
                        </View>
                        <Text className="text-slate-300 dark:text-slate-600">•</Text>
                        <View className="flex-row items-center gap-1.5">
                          <ShieldCheck size={13} color="#10B981" />
                          <Text className="font-inter-medium text-[11px] text-slate-700 dark:text-slate-300">
                            {pkg.reportTurnaround} Turnaround
                          </Text>
                        </View>
                        <Text className="text-slate-300 dark:text-slate-600">•</Text>
                        <Text className="font-inter-medium text-[11px] text-slate-500">
                          {pkg.sampleType}
                        </Text>
                      </View>

                      {/* Expandable Tests List */}
                      <View className="border-t border-[#EDF3F4] dark:border-[#163656] pt-2.5">
                        <Pressable
                          onPress={() => setExpandedPackageId(isExpanded ? null : pkg.id)}
                          className="flex-row items-center justify-between py-1"
                        >
                          <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE]">
                            {isExpanded ? 'Hide test breakdown' : `View all ${pkg.testsCovered.length} tests covered`}
                          </Text>
                          {isExpanded ? (
                            <ChevronUp size={15} color="#006D77" />
                          ) : (
                            <ChevronDown size={15} color="#006D77" />
                          )}
                        </Pressable>

                        {isExpanded && (
                          <View className="mt-2 space-y-1.5 bg-[#F8FAFB] dark:bg-[#091522] p-3 rounded-2xl border border-[#E6ECEF] dark:border-[#163656]">
                            {pkg.testsCovered.map((t, tIdx) => (
                              <View key={tIdx} className="flex-row items-start gap-2">
                                <CheckCircle2 size={13} color="#006D77" className="mt-0.5" />
                                <Text className="font-inter text-xs text-slate-700 dark:text-slate-300 flex-1">
                                  {t}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Pricing & CTA */}
                      <View className="flex-row items-center justify-between pt-2 border-t border-[#EDF3F4] dark:border-[#163656]">
                        <View>
                          <View className="flex-row items-baseline gap-1.5">
                            <Text className="font-inter-bold text-lg text-[#006D77] dark:text-[#83C5BE]">
                              ₹{pkg.discountedPrice}
                            </Text>
                            <Text className="font-inter text-xs text-slate-400 line-through">
                              ₹{pkg.originalPrice}
                            </Text>
                          </View>
                          <Text className="font-inter text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Free home sample collection
                          </Text>
                        </View>

                        <MotionPressable
                          onPress={() => handleOpenBooking(pkg)}
                          className="rounded-full bg-[#006D77] px-5 py-2.5 flex-row items-center gap-1.5 shadow-sm"
                        >
                          <Text className="font-inter-bold text-xs text-white">Book Home Visit</Text>
                        </MotionPressable>
                      </View>
                    </Card>
                  </MotionView>
                );
              })
            )}
          </>
        ) : (
          /* ── MY BOOKINGS TAB ── */
          <>
            {myBookings.length === 0 ? (
              <Card className="items-center py-12 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                <Activity size={36} color="#006D77" />
                <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                  No active diagnostic bookings
                </Text>
                <Text className="font-inter text-xs text-slate-500 text-center max-w-xs">
                  Schedule blood checkups and full body screening tests from the comfort of your home.
                </Text>
                <Button
                  title="Browse Diagnostic Packages"
                  size="sm"
                  onPress={() => setActiveTab('PACKAGES')}
                />
              </Card>
            ) : (
              myBookings.map((b, idx) => {
                const isScheduled = b.status === 'SCHEDULED';
                return (
                  <MotionView key={b.id} delay={Math.min(idx * 40, 200)}>
                    <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                      <View className="flex-row items-center justify-between border-b border-[#EDF3F4] dark:border-[#163656] pb-2.5">
                        <View>
                          <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                            Ref: #{b.id}
                          </Text>
                          <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                            {b.packageName}
                          </Text>
                        </View>
                        <Badge
                          label={b.status}
                          variant={isScheduled ? 'success' : b.status === 'CANCELLED' ? 'danger' : 'info'}
                        />
                      </View>

                      {/* Phlebotomist & Slot */}
                      <View className="bg-[#F6F8F9] dark:bg-[#071320] p-3 rounded-2xl space-y-2">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-2">
                            <Calendar size={14} color="#006D77" />
                            <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-white">
                              {b.collectionDate} • {b.collectionSlot}
                            </Text>
                          </View>
                          <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                            ₹{b.price}
                          </Text>
                        </View>

                        <View className="flex-row items-start gap-2 pt-1 border-t border-[#E6ECEF] dark:border-[#163656]">
                          <MapPin size={13} color="#64748B" className="mt-0.5" />
                          <Text className="font-inter text-xs text-slate-600 dark:text-slate-300 flex-1">
                            {b.collectionAddress}
                          </Text>
                        </View>

                        {b.phlebotomistName && (
                          <View className="flex-row items-center justify-between pt-1 border-t border-[#E6ECEF] dark:border-[#163656]">
                            <View className="flex-row items-center gap-1.5">
                              <ShieldCheck size={14} color="#10B981" />
                              <Text className="font-inter-medium text-xs text-slate-700 dark:text-slate-300">
                                Phlebotomist: {b.phlebotomistName}
                              </Text>
                            </View>
                            <Text className="font-inter-semibold text-[11px] text-[#006D77] dark:text-[#83C5BE]">
                              {b.phlebotomistPhone}
                            </Text>
                          </View>
                        )}
                      </View>

                      {isScheduled && (
                        <View className="flex-row justify-end pt-1">
                          <TouchableOpacity
                            onPress={() => handleCancelBooking(b.id)}
                            className="px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30"
                          >
                            <Text className="font-inter-semibold text-xs text-rose-600 dark:text-rose-400">
                              Cancel Pickup
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </Card>
                  </MotionView>
                );
              })
            )}
          </>
        )}
      </ScrollView>

      {/* ── HOME SAMPLE COLLECTION BOOKING MODAL ── */}
      <Modal visible={Boolean(bookingPackage)} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/60"
        >
          <View
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            className="rounded-t-[32px] bg-white dark:bg-[#071320] p-6 max-h-[90%] border-t border-[#E2E8F0] dark:border-[#163656]"
          >
            {bookingSuccessData ? (
              // Booking Confirmed Success View
              <View className="items-center py-3 space-y-3">
                <View className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 p-4 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={46} color="#10B981" />
                </View>
                <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white text-center">
                  Sample Pickup Scheduled!
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
                  Our certified phlebotomist has been allocated and will arrive with a sterile sealed kit at your selected time.
                </Text>

                <Card className="w-full p-4 space-y-2.5 bg-[#F8FAFB] dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656]">
                  <View className="flex-row justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter text-xs text-slate-500">Booking Reference</Text>
                    <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]">
                      #{bookingSuccessData.id}
                    </Text>
                  </View>
                  <View className="flex-row justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter text-xs text-slate-500">Package</Text>
                    <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white" numberOfLines={1}>
                      {bookingSuccessData.packageName}
                    </Text>
                  </View>
                  <View className="flex-row justify-between pb-2 border-b border-[#E2E8F0] dark:border-[#163656]">
                    <Text className="font-inter text-xs text-slate-500">Scheduled Slot</Text>
                    <Text className="font-inter-semibold text-xs text-[#0B1F33] dark:text-slate-200">
                      {bookingSuccessData.collectionDate} • {bookingSuccessData.collectionSlot}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="font-inter text-xs text-slate-500">Assigned Phlebotomist</Text>
                    <Text className="font-inter-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {bookingSuccessData.phlebotomistName} ({bookingSuccessData.phlebotomistPhone})
                    </Text>
                  </View>
                </Card>

                <Button
                  title="View My Bookings"
                  onPress={() => {
                    setBookingPackage(null);
                    setBookingSuccessData(null);
                    setActiveTab('MY_BOOKINGS');
                  }}
                />
              </View>
            ) : (
              // Booking Form View
              <>
                <View className="flex-row items-center justify-between pb-3 border-b border-[#EDF3F4] dark:border-[#163656]">
                  <View className="flex-1 pr-2">
                    <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white" numberOfLines={1}>
                      Book Home Sample Collection
                    </Text>
                    <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">
                      {bookingPackage?.name} • ₹{bookingPackage?.discountedPrice}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setBookingPackage(null)}
                    className="h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
                  >
                    <X size={17} color="#94A3B8" />
                  </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 14 }}>
                  {/* Patient Name & Phone */}
                  <View className="space-y-1">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Patient Full Name *
                    </Text>
                    <TextInput
                      value={patientName}
                      onChangeText={setPatientName}
                      placeholder="e.g. Ramesh Kumar"
                      placeholderTextColor="#94A3B8"
                      className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3.5 py-2.5 font-inter text-xs text-[#0B1F33] dark:text-white"
                    />
                  </View>

                  <View className="space-y-1">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Contact Mobile Number (for Phlebotomist Coordination) *
                    </Text>
                    <TextInput
                      value={patientPhone}
                      onChangeText={setPatientPhone}
                      placeholder="e.g. 9876543210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3.5 py-2.5 font-inter text-xs text-[#0B1F33] dark:text-white"
                    />
                  </View>

                  {/* Doorstep Address */}
                  <View className="space-y-1">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Sample Pickup Doorstep Address *
                    </Text>
                    <TextInput
                      value={collectionAddress}
                      onChangeText={setCollectionAddress}
                      placeholder="House / Flat No, Street, Landmark, Area & Pincode"
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={2}
                      className="bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656] rounded-xl px-3.5 py-2.5 font-inter text-xs text-[#0B1F33] dark:text-white min-h-[55px]"
                    />
                  </View>

                  {/* Date Selection (Today / Tomorrow / Day After) */}
                  <View className="space-y-1.5">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Collection Date
                    </Text>
                    <View className="flex-row gap-2">
                      {dateOptions.map((opt, i) => {
                        const selected = selectedDateIndex === i;
                        return (
                          <Pressable
                            key={opt.key}
                            onPress={() => setSelectedDateIndex(i)}
                            className={`flex-1 py-2.5 rounded-2xl items-center border ${
                              selected
                                ? 'bg-[#006D77] border-[#006D77]'
                                : 'bg-[#F6F8F9] dark:bg-[#112A44] border-[#E2E8F0] dark:border-[#163656]'
                            }`}
                          >
                            <Text
                              className={`font-inter-bold text-xs ${
                                selected ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                              }`}
                            >
                              {opt.dayLabel}
                            </Text>
                            <Text
                              className={`font-inter text-[10px] ${
                                selected ? 'text-white/80' : 'text-slate-400'
                              }`}
                            >
                              {opt.dateLabel}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Time Slot Selection */}
                  <View className="space-y-1.5">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Collection Slot
                    </Text>
                    <View className="space-y-1.5">
                      {TIME_SLOTS.map((s) => {
                        const active = selectedSlot === s.label;
                        return (
                          <Pressable
                            key={s.id}
                            onPress={() => setSelectedSlot(s.label)}
                            className={`flex-row items-center justify-between px-3.5 py-2.5 rounded-xl border ${
                              active
                                ? 'bg-[#006D77]/10 dark:bg-[#006D77]/25 border-[#006D77]'
                                : 'bg-[#F6F8F9] dark:bg-[#112A44] border-[#E2E8F0] dark:border-[#163656]'
                            }`}
                          >
                            <Text
                              className={`font-inter-semibold text-xs ${
                                active ? 'text-[#006D77] dark:text-[#83C5BE]' : 'text-[#0B1F33] dark:text-white'
                              }`}
                            >
                              {s.label}
                            </Text>
                            <Text className="font-inter text-[10px] text-slate-400">
                              {s.note}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Payment Mode */}
                  <View className="space-y-1.5">
                    <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">
                      Payment Mode
                    </Text>
                    <View className="flex-row gap-2">
                      <Pressable
                        onPress={() => setPaymentMethod('UPI')}
                        className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                          paymentMethod === 'UPI'
                            ? 'bg-[#006D77] border-[#006D77]'
                            : 'bg-[#F6F8F9] dark:bg-[#112A44] border-[#E2E8F0] dark:border-[#163656]'
                        }`}
                      >
                        <Smartphone size={14} color={paymentMethod === 'UPI' ? '#FFF' : '#64748B'} />
                        <Text
                          className={`font-inter-semibold text-xs ${
                            paymentMethod === 'UPI' ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                          }`}
                        >
                          UPI / Online
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setPaymentMethod('PAY_ON_COLLECTION')}
                        className={`flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border ${
                          paymentMethod === 'PAY_ON_COLLECTION'
                            ? 'bg-[#006D77] border-[#006D77]'
                            : 'bg-[#F6F8F9] dark:bg-[#112A44] border-[#E2E8F0] dark:border-[#163656]'
                        }`}
                      >
                        <CreditCard size={14} color={paymentMethod === 'PAY_ON_COLLECTION' ? '#FFF' : '#64748B'} />
                        <Text
                          className={`font-inter-semibold text-xs ${
                            paymentMethod === 'PAY_ON_COLLECTION' ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                          }`}
                        >
                          Pay on Pickup
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Confirm CTA */}
                  <Button
                    title={
                      isSubmittingBooking
                        ? 'Confirming Slot...'
                        : `Confirm Home Sample Collection • ₹${bookingPackage?.discountedPrice}`
                    }
                    isLoading={isSubmittingBooking}
                    disabled={isSubmittingBooking}
                    onPress={handleExecuteBooking}
                    className="mt-2"
                  />
                </ScrollView>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
