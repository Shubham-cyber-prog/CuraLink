import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  MapPin,
  Stethoscope,
  Phone,
  Mail,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { MotionView } from '../../components/Motion';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

interface DoctorItem {
  id: string;
  specialization: string;
  medicalLicenseNumber: string;
  experienceYears: number;
  consultationFee: number;
  city: string | null;
  verificationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export default function AdminDoctorsScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/doctors?limit=50');
      if (res?.data?.items && Array.isArray(res.data.items)) {
        setDoctors(res.data.items);
      } else if (Array.isArray(res?.data)) {
        setDoctors(res.data);
      }
    } catch (e) {
      console.warn('Could not load doctors for admin:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDoctors();
  }, [fetchDoctors]);

  const handleUpdateStatus = async (doctor: DoctorItem, newStatus: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    const actionLabel = newStatus === 'APPROVED' ? 'Approve' : newStatus === 'REJECTED' ? 'Reject' : 'Reset to Pending';
    Alert.alert(
      `${actionLabel} Doctor?`,
      `Are you sure you want to mark ${doctor.user?.name || 'this doctor'} as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: newStatus === 'REJECTED' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdatingId(doctor.id);
            try {
              const res = await api.put<any>(`/admin/doctors/${doctor.id}/verify-status`, {
                status: newStatus,
              });
              if (!res.success) {
                throw new Error(res.message || 'Status update failed');
              }
              // Optimistic update
              setDoctors((prev) =>
                prev.map((d) => (d.id === doctor.id ? { ...d, verificationStatus: newStatus } : d))
              );
              Alert.alert('Status Updated', `Doctor status set to ${newStatus}.`);
            } catch (err: any) {
              Alert.alert('Update Failed', err?.message || 'Could not update verification status.');
            } finally {
              setUpdatingId(null);
            }
          },
        },
      ]
    );
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (filterStatus !== 'ALL' && doc.verificationStatus !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (doc.user?.name || '').toLowerCase();
      const spec = (doc.specialization || '').toLowerCase();
      const lic = (doc.medicalLicenseNumber || '').toLowerCase();
      const city = (doc.city || '').toLowerCase();
      return name.includes(q) || spec.includes(q) || lic.includes(q) || city.includes(q);
    }
    return true;
  });

  const pendingCount = doctors.filter((d) => d.verificationStatus === 'PENDING').length;

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        className="bg-white dark:bg-[#0B1F33] px-5 pb-3 border-b border-[#E6ECEF] dark:border-[#1B3650]"
      >
        <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">
          Doctor Verifications
        </Text>
        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review NMC medical registrations &amp; practice applications
        </Text>

        {/* Search Bar */}
        <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] px-3.5 py-2">
          <Search size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by doctor name, specialization, NMC..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 font-inter text-xs text-[#0B1F33] dark:text-white p-0"
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 flex-row gap-2">
          {(
            [
              { id: 'ALL', label: `All (${doctors.length})` },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'REJECTED', label: 'Rejected' },
            ] as const
          ).map((item) => {
            const isSelected = filterStatus === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setFilterStatus(item.id)}
                activeOpacity={0.7}
                className={`px-3 py-1 rounded-full border mr-2 ${
                  isSelected
                    ? 'bg-[#006D77] border-[#006D77]'
                    : 'bg-[#F4F7F8] dark:bg-[#06101B] border-[#E6ECEF] dark:border-[#1B3650]'
                }`}
              >
                <Text
                  className={`font-inter-bold text-xs ${
                    isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#006D77" />
          <Text className="font-inter text-xs text-slate-400 mt-3">Loading doctor registrations...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 90, 110),
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006D77" />}
        >
          {filteredDoctors.length === 0 ? (
            <View className="py-16 items-center">
              <Stethoscope size={36} color="#94A3B8" />
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white mt-3">
                No doctors found
              </Text>
              <Text className="font-inter text-xs text-slate-400 mt-1">
                Try selecting another filter or clearing the search bar.
              </Text>
            </View>
          ) : (
            filteredDoctors.map((doc) => {
              const isPending = doc.verificationStatus === 'PENDING';
              const isApproved = doc.verificationStatus === 'APPROVED';
              const isRejected = doc.verificationStatus === 'REJECTED';
              const isUpdating = updatingId === doc.id;

              return (
                <Card key={doc.id} className="p-4 space-y-3">
                  {/* Top Doctor Info */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View className="h-10 w-10 rounded-xl bg-[#EAF4F5] dark:bg-[#112942] items-center justify-center">
                        <Stethoscope size={20} color="#006D77" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {doc.user?.name || 'Dr. Clinician'}
                        </Text>
                        <Text className="font-inter text-xs text-[#006D77] dark:text-[#83C5BE]">
                          {doc.specialization} • {doc.experienceYears}+ yrs
                        </Text>
                      </View>
                    </View>

                    <Badge
                      label={doc.verificationStatus}
                      variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'}
                    />
                  </View>

                  {/* Details Grid */}
                  <View className="rounded-2xl bg-[#F6F8F9] dark:bg-[#06101B] p-2.5 space-y-1.5 border border-[#E6ECEF] dark:border-[#1B3650]">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Award size={13} color="#94A3B8" />
                        <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">NMC License:</Text>
                      </View>
                      <Text className="font-mono text-[11px] font-semibold text-[#0B1F33] dark:text-white">
                        {doc.medicalLicenseNumber}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <MapPin size={13} color="#94A3B8" />
                        <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">City / Fee:</Text>
                      </View>
                      <Text className="font-inter text-[11px] font-semibold text-[#0B1F33] dark:text-white">
                        {doc.city || 'India'} • ₹{doc.consultationFee}
                      </Text>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-1.5">
                        <Mail size={13} color="#94A3B8" />
                        <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">Email:</Text>
                      </View>
                      <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400" numberOfLines={1}>
                        {doc.user?.email}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row items-center gap-2 pt-1">
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#006D77" />
                    ) : (
                      <>
                        {!isApproved && (
                          <TouchableOpacity
                            onPress={() => handleUpdateStatus(doc, 'APPROVED')}
                            activeOpacity={0.8}
                            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700"
                          >
                            <CheckCircle2 size={14} color="#FFFFFF" />
                            <Text className="font-inter-bold text-xs text-white">Approve</Text>
                          </TouchableOpacity>
                        )}

                        {!isRejected && (
                          <TouchableOpacity
                            onPress={() => handleUpdateStatus(doc, 'REJECTED')}
                            activeOpacity={0.8}
                            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-600 active:bg-rose-700"
                          >
                            <XCircle size={14} color="#FFFFFF" />
                            <Text className="font-inter-bold text-xs text-white">Reject</Text>
                          </TouchableOpacity>
                        )}

                        {(isApproved || isRejected) && (
                          <TouchableOpacity
                            onPress={() => handleUpdateStatus(doc, 'PENDING')}
                            activeOpacity={0.8}
                            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <Text className="font-inter-semibold text-xs text-slate-600 dark:text-slate-300">
                              Reset
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}
