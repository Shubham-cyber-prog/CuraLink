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
        <View className={`rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ${pressed ? 'bg-slate-50' : ''}`}>
          <View className="flex-row items-start justify-between">
            <View className="flex-1 flex-row items-center pr-3">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
                <Stethoscope color="#0D9488" size={22} />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-base text-charcoal">{appointment.doctorName}</Text>
                <Text className="mt-1 font-inter text-sm text-muted">{appointment.specialty}</Text>
              </View>
            </View>
            <ChevronRight color="#94A3B8" size={20} />
          </View>
          <View className="my-4 h-px bg-slate-100" />
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center">
                <CalendarDays color="#64748B" size={15} />
                <Text className="ml-2 font-inter-medium text-sm text-charcoal">{appointment.dateLabel}</Text>
              </View>
              <View className="mt-2 flex-row items-center">
                <Clock3 color="#64748B" size={15} />
                <Text className="ml-2 font-inter text-sm text-muted">{appointment.timeLabel}</Text>
              </View>
            </View>
            <Badge label={isConfirmed ? 'Confirmed' : 'Pending'} variant={isConfirmed ? 'success' : 'warning'} />
          </View>
        </View>
      )}
    </Pressable>
  );
}
