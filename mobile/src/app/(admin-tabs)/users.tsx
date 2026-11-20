import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Users, Search, User, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { api } from '../../lib/api';
import { useTheme } from '../../lib/theme-context';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone?: string | null;
  age?: number | null;
  gender?: string | null;
  createdAt: string;
  doctorProfile?: {
    specialization: string;
    verificationStatus: string;
  } | null;
}

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'PATIENT' | 'DOCTOR' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/users?limit=60');
      if (res?.data?.items && Array.isArray(res.data.items)) {
        setUsers(res.data.items);
      } else if (Array.isArray(res?.data)) {
        setUsers(res.data);
      }
    } catch (e) {
      console.warn('Could not load users for admin:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    }
    return true;
  });

  return (
    <View className="flex-1 bg-[#F4F7F8] dark:bg-[#06101B]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        className="bg-white dark:bg-[#0B1F33] px-5 pb-3 border-b border-[#E6ECEF] dark:border-[#1B3650]"
      >
        <Text className="font-inter-bold text-xl text-[#0B1F33] dark:text-white">
          Platform User Registry
        </Text>
        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of all patients, clinicians, and administrators
        </Text>

        {/* Search */}
        <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl bg-[#F4F7F8] dark:bg-[#06101B] border border-[#E6ECEF] dark:border-[#1B3650] px-3.5 py-2">
          <Search size={16} color="#94A3B8" />
          <TextInput
            placeholder="Search by name, email, phone..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 font-inter text-xs text-[#0B1F33] dark:text-white p-0"
          />
        </View>

        {/* Role Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2.5 flex-row gap-2">
          {(
            [
              { id: 'ALL', label: `All (${users.length})` },
              { id: 'PATIENT', label: 'Patients' },
              { id: 'DOCTOR', label: 'Doctors' },
              { id: 'ADMIN', label: 'Admins' },
            ] as const
          ).map((item) => {
            const isSelected = roleFilter === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setRoleFilter(item.id)}
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
          <Text className="font-inter text-xs text-slate-400 mt-3">Loading user registry...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 90, 110),
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006D77" />}
        >
          {filteredUsers.length === 0 ? (
            <View className="py-16 items-center">
              <Users size={36} color="#94A3B8" />
              <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white mt-3">
                No users found
              </Text>
            </View>
          ) : (
            filteredUsers.map((item) => {
              const isDoctor = item.role === 'DOCTOR';
              const isAdmin = item.role === 'ADMIN';

              return (
                <Card key={item.id} className="p-3.5 space-y-2">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                      <View
                        className={`h-9 w-9 rounded-xl items-center justify-center ${
                          isAdmin
                            ? 'bg-amber-100 dark:bg-amber-950/40'
                            : isDoctor
                            ? 'bg-emerald-100 dark:bg-emerald-950/40'
                            : 'bg-blue-100 dark:bg-blue-950/40'
                        }`}
                      >
                        <User
                          size={18}
                          color={isAdmin ? '#D97706' : isDoctor ? '#059669' : '#2563EB'}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {item.name || 'Member'}
                        </Text>
                        <Text className="font-inter text-xs text-slate-400" numberOfLines={1}>
                          {item.email}
                        </Text>
                      </View>
                    </View>

                    <Badge
                      label={item.role}
                      variant={isAdmin ? 'warning' : isDoctor ? 'success' : 'default'}
                    />
                  </View>

                  <View className="flex-row items-center justify-between pt-1 border-t border-[#EDF3F4] dark:border-[#1B3650] text-[11px]">
                    <View className="flex-row items-center gap-1">
                      <Calendar size={12} color="#94A3B8" />
                      <Text className="font-inter text-[11px] text-slate-400">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </Text>
                    </View>

                    {item.doctorProfile?.specialization && (
                      <Text className="font-inter-semibold text-[11px] text-[#006D77] dark:text-[#83C5BE]">
                        {item.doctorProfile.specialization}
                      </Text>
                    )}

                    {item.age ? (
                      <Text className="font-inter text-[11px] text-slate-400">
                        {item.age} yrs • {item.gender || 'Member'}
                      </Text>
                    ) : null}
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
