import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CalendarDays, ChevronRight, Clock3, Stethoscope } from 'lucide-react-native';
import { Badge } from '../UI';
import type { AppointmentPreview } from '../../types/healthcare';

interface UpcomingAppointmentCardProps {
  appointment: AppointmentPreview;
  onPress: () => void;
}

export function UpcomingAppointmentCard({ appointment, onPress }: UpcomingAppointmentCardProps) {
  const isConfirmed = appointment.status === 'confirmed';

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View upcoming appointment" onPress={onPress}>
      {({ pressed }) => (
        <View className={`rounded-2xl bg-white dark:bg-[#151B2E] border border-slate-100 dark:border-[#263049] p-5 shadow-sm shadow-slate-200 dark:shadow-none ${pressed ? 'bg-slate-50 dark:bg-[#1C2338]' : ''}`}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center pr-3">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100/60 dark:border-teal-800/40">
                <Stethoscope color="#0D9488" size={22} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-charcoal dark:text-[#F1F5F9]">{appointment.doctorName}</Text>
                <Text className="mt-1 font-inter text-sm text-muted dark:text-slate-400">{appointment.specialty}</Text>
              </View>
            </View>
            <ChevronRight color="#94A3B8" size={20} />
          </View>
          <View className="my-4 h-px bg-slate-100 dark:bg-[#263049]" />
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center">
                <CalendarDays color="#64748B" size={15} />
                <Text className="ml-2 font-inter-medium text-sm text-charcoal dark:text-[#F1F5F9]">{appointment.dateLabel}</Text>
              </View>
              <View className="mt-2 flex-row items-center">
                <Clock3 color="#64748B" size={15} />
                <Text className="ml-2 font-inter text-sm text-muted dark:text-slate-400">{appointment.timeLabel}</Text>
              </View>
            </View>
            <Badge label={isConfirmed ? 'Confirmed' : 'Pending'} variant={isConfirmed ? 'success' : 'warning'} />
          </View>
        </View>
      )}
    </Pressable>
  );
}
