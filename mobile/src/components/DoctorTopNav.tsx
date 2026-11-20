import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Stethoscope,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { useAuth } from '../lib/auth-context';

interface DoctorTopNavProps {
  currentTab: 'index' | 'appointments' | 'schedule' | 'patients' | 'profile' | 'earnings';
  pendingCount?: number;
}

const DOCTOR_NAV_ITEMS = [
  { id: 'index', label: 'Dashboard', route: '/(doctor-tabs)', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', route: '/(doctor-tabs)/appointments', icon: CalendarCheck },
  { id: 'earnings', label: 'Earnings', route: '/(doctor-tabs)/earnings', icon: IndianRupee },
  { id: 'schedule', label: 'Schedule', route: '/(doctor-tabs)/schedule', icon: Calendar },
  { id: 'patients', label: 'Patients', route: '/(doctor-tabs)/patients', icon: Users },
  { id: 'profile', label: 'Practice & Fees', route: '/(doctor-tabs)/profile', icon: Stethoscope },
];

export function DoctorTopNav({ currentTab, pendingCount }: DoctorTopNavProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [isAvailable, setIsAvailable] = useState(true);

  const doctorName = user?.name
    ? user.name.startsWith('Dr.')
      ? user.name
      : `Dr. ${user.name}`
    : 'Dr. Specialist';

  return (
    <View
      style={{ paddingTop: Math.max(insets.top + 6, 16) }}
      className="bg-white dark:bg-[#0B1F33] border-b border-[#E6ECEF] dark:border-[#163656] shadow-xs"
    >
      {/* Top Clinician Brand Strip */}
      <View className="px-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5 flex-1 pr-2">
          <View className="h-10 w-10 rounded-2xl bg-[#006D77] items-center justify-center shadow-xs">
            <Stethoscope size={20} color="#FFFFFF" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                {doctorName}
              </Text>
              <ShieldCheck size={14} color="#006D77" />
            </View>
            <Text className="font-inter text-[11px] text-slate-500 dark:text-slate-400">
              National Medical Commission Verified
            </Text>
          </View>
        </View>

        {/* Live Availability Status Pill */}
        <TouchableOpacity
          onPress={() => setIsAvailable((prev) => !prev)}
          activeOpacity={0.8}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
            isAvailable
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800'
          }`}
        >
          <View className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <Text
            className={`font-inter-bold text-[10px] ${
              isAvailable ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {isAvailable ? 'Online' : 'In Consult'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Page Navigation Tabs Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 10,
          gap: 6,
        }}
      >
        {DOCTOR_NAV_ITEMS.map((item) => {
          const active = currentTab === item.id;
          const Icon = item.icon;
          const showBadge = item.id === 'appointments' && typeof pendingCount === 'number' && pendingCount > 0;

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (!active) {
                  router.push(item.route as any);
                }
              }}
              activeOpacity={0.75}
              className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-xl border ${
                active
                  ? 'bg-[#006D77] border-[#006D77] shadow-xs'
                  : 'bg-[#F6F8F9] dark:bg-[#112A44] border-[#E2E8F0] dark:border-[#163656]'
              }`}
            >
              <Icon
                size={14}
                color={active ? '#FFFFFF' : isDark ? '#83C5BE' : '#006D77'}
                strokeWidth={active ? 2.4 : 1.8}
              />
              <Text
                className={`font-inter-bold text-xs ${
                  active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                }`}
              >
                {item.label}
              </Text>

              {showBadge && (
                <View className="ml-0.5 rounded-full bg-amber-500 px-1.5 py-0.2">
                  <Text className="font-inter-bold text-[9px] text-white">
                    {pendingCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
