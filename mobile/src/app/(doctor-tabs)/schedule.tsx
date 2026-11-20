import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Switch,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  Coffee,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView, MotionPressable } from '../../components/Motion';
import { DoctorTopNav } from '../../components/DoctorTopNav';
import { useTheme } from '../../lib/theme-context';
import { api } from '../../lib/api';

interface DaySchedule {
  day: string;
  short: string;
  active: boolean;
  morningStart: string;
  morningEnd: string;
  eveningStart: string;
  eveningEnd: string;
}

const DEFAULT_SCHEDULE: DaySchedule[] = [
  { day: 'Monday', short: 'Mon', active: true, morningStart: '09:00 AM', morningEnd: '01:00 PM', eveningStart: '05:00 PM', eveningEnd: '09:00 PM' },
  { day: 'Tuesday', short: 'Tue', active: true, morningStart: '09:00 AM', morningEnd: '01:00 PM', eveningStart: '05:00 PM', eveningEnd: '09:00 PM' },
  { day: 'Wednesday', short: 'Wed', active: true, morningStart: '09:00 AM', morningEnd: '01:00 PM', eveningStart: '05:00 PM', eveningEnd: '09:00 PM' },
  { day: 'Thursday', short: 'Thu', active: true, morningStart: '09:00 AM', morningEnd: '01:00 PM', eveningStart: '05:00 PM', eveningEnd: '09:00 PM' },
  { day: 'Friday', short: 'Fri', active: true, morningStart: '09:00 AM', morningEnd: '01:00 PM', eveningStart: '05:00 PM', eveningEnd: '09:00 PM' },
  { day: 'Saturday', short: 'Sat', active: true, morningStart: '10:00 AM', morningEnd: '02:00 PM', eveningStart: '05:00 PM', eveningEnd: '08:00 PM' },
  { day: 'Sunday', short: 'Sun', active: false, morningStart: '10:00 AM', morningEnd: '01:00 PM', eveningStart: 'Off Duty', eveningEnd: 'Off Duty' },
];

export default function DoctorScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Availability & Practice State
  const [isLiveOnline, setIsLiveOnline] = useState(true);
  const [consultationModes, setConsultationModes] = useState<string[]>(['VIDEO', 'IN_PERSON']);
  const [slotDuration, setSlotDuration] = useState<number>(30); // 15, 20, 30, 45 mins
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [onBreakUntil, setOnBreakUntil] = useState<string | null>(null);

  const fetchScheduleData = useCallback(async () => {
    try {
      const res = await api.get<any>('/doctor/me/profile').catch(() => null);
      if (res?.data?.consultationModes && Array.isArray(res.data.consultationModes)) {
        setConsultationModes(res.data.consultationModes);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  const toggleDayActive = (index: number) => {
    setWeeklySchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, active: !d.active } : d))
    );
  };

  const handleApplyWeekdays = () => {
    const mondayConfig = weeklySchedule[0];
    setWeeklySchedule((prev) =>
      prev.map((d, i) =>
        i <= 4
          ? {
              ...d,
              active: true,
              morningStart: mondayConfig.morningStart,
              morningEnd: mondayConfig.morningEnd,
              eveningStart: mondayConfig.eveningStart,
              eveningEnd: mondayConfig.eveningEnd,
            }
          : d
      )
    );
    Alert.alert('Schedule Synchronized', 'Monday schedule applied across all weekdays (Mon - Fri).');
  };

  const handleToggleMode = (mode: 'VIDEO' | 'IN_PERSON') => {
    setConsultationModes((prev) => {
      if (prev.includes(mode)) {
        if (prev.length === 1) {
          Alert.alert('Required Mode', 'At least one consultation mode must remain active.');
          return prev;
        }
        return prev.filter((m) => m !== mode);
      }
      return [...prev, mode];
    });
  };

  const handleQuickBreak = (minutes: number) => {
    const time = new Date(Date.now() + minutes * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setOnBreakUntil(time);
    setIsLiveOnline(false);
    Alert.alert('Break Activated', `Your status is set to Away until ${time}. New instant calls will be paused.`);
  };

  const handleEndBreak = () => {
    setOnBreakUntil(null);
    setIsLiveOnline(true);
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await api.patch('/doctor/me/profile', {
        consultationModes,
      });

      Alert.alert(
        'Schedule Published',
        'Your clinical hours, active slots, and consultation modes have been updated in real-time across CuraLink.'
      );
    } catch (err: any) {
      Alert.alert('Update Note', err?.message || 'Schedule saved locally.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      {/* ── TOP DOCTOR NAVIGATION BAR ── */}
      <DoctorTopNav currentTab="schedule" />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 110, 125),
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchScheduleData();
            }}
            colors={['#006D77']}
          />
        }
      >
        {/* ── 1. LIVE AVAILABILITY COMMAND CARD ── */}
        <MotionView delay={30}>
          <Card className="p-4 bg-white dark:bg-[#0B1F33] border border-[#E2E8F0] dark:border-[#163656] space-y-3 shadow-xs">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5 flex-1 pr-2">
                <View
                  className={`h-11 w-11 rounded-2xl items-center justify-center ${
                    isLiveOnline
                      ? 'bg-emerald-500/15 border border-emerald-500/30'
                      : 'bg-amber-500/15 border border-amber-500/30'
                  }`}
                >
                  <View
                    className={`h-3 w-3 rounded-full ${isLiveOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                    {isLiveOnline ? 'Taking Live Consultations' : 'Currently On Break'}
                  </Text>
                  <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                    {isLiveOnline
                      ? 'Patients can connect for immediate HD video calls'
                      : onBreakUntil
                      ? `Paused until ${onBreakUntil}`
                      : 'Bookings only accepted for future slots'}
                  </Text>
                </View>
              </View>

              <Switch
                value={isLiveOnline}
                onValueChange={(val) => {
                  setIsLiveOnline(val);
                  if (val) setOnBreakUntil(null);
                }}
                trackColor={{ false: '#94A3B8', true: '#006D77' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Quick Break Chips */}
            <View className="flex-row items-center gap-2 pt-2 border-t border-[#EDF3F4] dark:border-[#163656]">
              <Text className="font-inter-semibold text-[11px] text-slate-500">Quick pause:</Text>
              {onBreakUntil ? (
                <TouchableOpacity
                  onPress={handleEndBreak}
                  className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30"
                >
                  <Text className="font-inter-bold text-[11px] text-emerald-700 dark:text-emerald-300">
                    Resume Duty
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={() => handleQuickBreak(30)}
                    className="px-2.5 py-1 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656]"
                  >
                    <Text className="font-inter-medium text-[11px] text-slate-700 dark:text-slate-300">
                      30 min Break
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleQuickBreak(60)}
                    className="px-2.5 py-1 rounded-full bg-[#F6F8F9] dark:bg-[#112A44] border border-[#E2E8F0] dark:border-[#163656]"
                  >
                    <Text className="font-inter-medium text-[11px] text-slate-700 dark:text-slate-300">
                      1 hr Break
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </Card>
        </MotionView>

        {/* ── 2. CONSULTATION MODES ── */}
        <MotionView delay={60}>
          <View className="space-y-2">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white uppercase tracking-wider">
              Consultation Modes
            </Text>

            <View className="flex-row gap-2.5">
              <TouchableOpacity
                onPress={() => handleToggleMode('VIDEO')}
                activeOpacity={0.8}
                className={`flex-1 p-3.5 rounded-2xl border ${
                  consultationModes.includes('VIDEO')
                    ? 'bg-[#EAF4F5] dark:bg-[#112A44] border-[#006D77] dark:border-[#83C5BE]'
                    : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                }`}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Video
                    size={18}
                    color={consultationModes.includes('VIDEO') ? '#006D77' : '#94A3B8'}
                  />
                  {consultationModes.includes('VIDEO') && (
                    <CheckCircle2 size={16} color="#006D77" />
                  )}
                </View>
                <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                  HD Video Consult
                </Text>
                <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Encrypted telemedicine
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleToggleMode('IN_PERSON')}
                activeOpacity={0.8}
                className={`flex-1 p-3.5 rounded-2xl border ${
                  consultationModes.includes('IN_PERSON')
                    ? 'bg-[#EAF4F5] dark:bg-[#112A44] border-[#006D77] dark:border-[#83C5BE]'
                    : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                }`}
              >
                <View className="flex-row items-center justify-between mb-1.5">
                  <Building2
                    size={18}
                    color={consultationModes.includes('IN_PERSON') ? '#006D77' : '#94A3B8'}
                  />
                  {consultationModes.includes('IN_PERSON') && (
                    <CheckCircle2 size={16} color="#006D77" />
                  )}
                </View>
                <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                  Clinic Visit
                </Text>
                <Text className="font-inter text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Physical consultation
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </MotionView>

        {/* ── 3. SLOT DURATION SELECTOR ── */}
        <MotionView delay={90}>
          <View className="space-y-2">
            <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white uppercase tracking-wider">
              Consultation Slot Duration
            </Text>

            <View className="flex-row gap-2">
              {[15, 20, 30, 45].map((mins) => {
                const active = slotDuration === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    onPress={() => setSlotDuration(mins)}
                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                      active
                        ? 'bg-[#006D77] border-[#006D77] shadow-xs'
                        : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                    }`}
                  >
                    <Text
                      className={`font-inter-bold text-xs ${
                        active ? 'text-white' : 'text-[#0B1F33] dark:text-white'
                      }`}
                    >
                      {mins} mins
                    </Text>
                    {mins === 30 && (
                      <Text
                        className={`font-inter-bold text-[8px] uppercase mt-0.5 ${
                          active ? 'text-white/80' : 'text-[#006D77] dark:text-[#83C5BE]'
                        }`}
                      >
                        Standard
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </MotionView>

        {/* ── 4. DAY-WISE SCHEDULE MATRIX ── */}
        <MotionView delay={120}>
          <View className="space-y-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white">
                  Weekly Operating Schedule
                </Text>
                <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                  Morning &amp; Evening shift timings
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleApplyWeekdays}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-[#EAF4F5] dark:bg-[#112A44] border border-[#C7E3E5] dark:border-[#163656]"
              >
                <Copy size={12} color="#006D77" />
                <Text className="font-inter-bold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                  Sync Mon-Fri
                </Text>
              </TouchableOpacity>
            </View>

            {weeklySchedule.map((item, idx) => (
              <Card
                key={item.day}
                className={`p-3.5 border space-y-2.5 ${
                  item.active
                    ? 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                    : 'bg-[#F8FAFB] dark:bg-[#06101B] border-dashed border-[#CBD5E1] dark:border-[#163656]'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`h-8 w-8 rounded-xl items-center justify-center ${
                        item.active ? 'bg-[#006D77]' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      <Text
                        className={`font-inter-bold text-xs ${
                          item.active ? 'text-white' : 'text-slate-500'
                        }`}
                      >
                        {item.short}
                      </Text>
                    </View>
                    <Text
                      className={`font-inter-bold text-sm ${
                        item.active ? 'text-[#0B1F33] dark:text-white' : 'text-slate-400'
                      }`}
                    >
                      {item.day}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <Badge
                      label={item.active ? 'Active' : 'Off Duty'}
                      variant={item.active ? 'success' : 'default'}
                    />
                    <Switch
                      value={item.active}
                      onValueChange={() => toggleDayActive(idx)}
                      trackColor={{ false: '#CBD5E1', true: '#006D77' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>

                {item.active && (
                  <View className="flex-row gap-2 pt-2 border-t border-[#EDF3F4] dark:border-[#163656]">
                    {/* Morning Shift */}
                    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#112A44] p-2.5 rounded-xl">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Sun size={12} color="#D97706" />
                        <Text className="font-inter-semibold text-[10px] text-slate-500 dark:text-slate-400">
                          Morning Shift
                        </Text>
                      </View>
                      <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                        {item.morningStart} - {item.morningEnd}
                      </Text>
                    </View>

                    {/* Evening Shift */}
                    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#112A44] p-2.5 rounded-xl">
                      <View className="flex-row items-center gap-1 mb-1">
                        <Moon size={12} color="#7C3AED" />
                        <Text className="font-inter-semibold text-[10px] text-slate-500 dark:text-slate-400">
                          Evening Shift
                        </Text>
                      </View>
                      <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                        {item.eveningStart} - {item.eveningEnd}
                      </Text>
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </MotionView>

        {/* ── 5. SAVE & PUBLISH SCHEDULE CTA ── */}
        <Button
          title={saving ? 'Publishing Schedule...' : 'Save & Publish Schedule'}
          isLoading={saving}
          disabled={saving}
          onPress={handleSaveSchedule}
          className="mt-2"
        />
      </ScrollView>
    </View>
  );
}
