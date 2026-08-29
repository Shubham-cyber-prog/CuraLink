import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { CalendarCheck, Video, Clock, Stethoscope } from 'lucide-react-native';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppointmentsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ 
        paddingTop: Math.max(insets.top, 16),
        paddingBottom: 40 
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Area */}
      <View className="px-5 pb-6 pt-4">
        <Text className="font-inter-bold text-3xl text-charcoal">
          My Appointments
        </Text>
        <Text className="mt-1 font-inter text-sm text-muted">
          Manage your upcoming and past medical visits
        </Text>
      </View>

      <View className="px-5 space-y-6">
        {/* Upcoming Section */}
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            <Text className="font-inter-semibold text-base text-charcoal">Upcoming Visitions</Text>
          </View>

          <Card className="border border-slate-100 bg-white">
            <View className="mb-4 flex-row items-center justify-between border-b border-slate-100 pb-4">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                  <CalendarCheck size={20} color="#0d9488" />
                </View>
                <View>
                  <Text className="font-inter-bold text-charcoal text-base">Dr. Sarah Jenkins</Text>
                  <Text className="font-inter text-sm text-muted">Cardiology Specialist</Text>
                </View>
              </View>
              <Badge label="Confirmed" variant="success" />
            </View>

            <View className="mb-4 flex-row items-center gap-2.5 rounded-xl bg-mint-bg p-3 border border-teal-100/50">
              <Clock size={16} color="#0d9488" />
              <Text className="font-inter-medium text-sm text-teal-800">
                Today, 10:00 AM - 10:30 AM
              </Text>
            </View>

            <Button
              title="Join Video Call"
              icon={Video}
              iconPosition="left"
            />
          </Card>
        </View>

        {/* Past Section */}
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            <Text className="font-inter-semibold text-base text-charcoal">Past History</Text>
          </View>

          <Card className="border border-slate-100 bg-white opacity-80">
            <View className="mb-4 flex-row items-center justify-between border-b border-slate-100 pb-4">
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Stethoscope size={20} color="#94a3b8" />
                </View>
                <View>
                  <Text className="font-inter-bold text-charcoal text-base">Dr. Michael Chen</Text>
                  <Text className="font-inter text-sm text-muted">General Practice Physician</Text>
                </View>
              </View>
              <Badge label="Completed" variant="default" />
            </View>

            <View className="flex-row items-center gap-2 px-1">
              <Clock size={16} color="#94a3b8" />
              <Text className="font-inter text-sm text-muted">Oct 12, 2026 • 02:00 PM</Text>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}
