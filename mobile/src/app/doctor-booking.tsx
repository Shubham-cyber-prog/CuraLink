import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, CheckCircle2 } from 'lucide-react-native';
import { Card } from '../components/UI';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BookingDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  fee: number;
}

const DOCTORS: BookingDoctor[] = [
  { id: '1', name: 'Dr. Sarah Jenkins', specialty: 'Cardiology Specialist', rating: 4.9, reviews: 128, fee: 150 },
  { id: '2', name: 'Dr. Michael Chen', specialty: 'General Practice Physician', rating: 4.8, reviews: 342, fee: 90 },
  { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics Specialist', rating: 4.9, reviews: 89, fee: 120 },
  { id: '4', name: 'Dr. James Wilson', specialty: 'Dermatology Specialist', rating: 4.7, reviews: 215, fee: 140 },
];

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '04:00 PM'];

export default function DoctorBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDoctor, setSelectedDoctor] = useState<BookingDoctor | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleBook = () => {
    setShowConfirmModal(true);
  };

  const handleFinish = () => {
    setShowConfirmModal(false);
    router.replace('/(tabs)/appointments');
  };

  if (selectedDoctor) {
    return (
      <View className="flex-1 bg-white">
        <ScreenHeader title="Book Appointment" onBack={() => setSelectedDoctor(null)} />

        <ScrollView 
          contentContainerStyle={{ 
            padding: 20,
            paddingBottom: Math.max(insets.bottom, 24)
          }} 
          className="bg-slate-50"
          showsVerticalScrollIndicator={false}
        >
          {/* Doctor Card */}
          <Card className="mb-6 border border-slate-100 bg-white flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
              <Text className="font-inter-semibold text-xl text-teal-600">
                {selectedDoctor.name.split(' ').map((namePart) => namePart[0]).join('').slice(0, 3)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="font-inter-bold text-lg text-charcoal">{selectedDoctor.name}</Text>
              <Text className="font-inter text-sm text-muted">{selectedDoctor.specialty}</Text>
              <View className="mt-1 flex-row items-center gap-1">
                <Star size={14} color="#eab308" fill="#eab308" />
                <Text className="font-inter-medium text-xs text-charcoal">{selectedDoctor.rating}</Text>
                <Text className="font-inter text-xs text-muted">({selectedDoctor.reviews} reviews)</Text>
              </View>
            </View>
          </Card>

          <Text className="mb-3 font-inter-semibold text-base text-charcoal">Available Time Slots</Text>
          <Text className="mb-4 font-inter text-xs text-muted">Today, Oct 24, 2026</Text>

          <View className="mb-6 flex-row flex-wrap gap-3">
            {TIME_SLOTS.map((time) => (
              <Pressable
                key={time}
                onPress={() => setSelectedTime(time)}
                className={`rounded-xl border px-4 py-3 ${
                  selectedTime === time 
                    ? 'border-teal-600 bg-teal-50' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Text 
                  className={`font-inter-semibold text-xs ${
                    selectedTime === time ? 'text-teal-700' : 'text-charcoal'
                  }`}
                >
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mb-6 flex-row items-center justify-between rounded-2xl bg-white p-4 border border-slate-100 shadow-sm">
            <Text className="font-inter text-sm text-muted">Consultation Fee</Text>
            <Text className="font-inter-bold text-lg text-teal-600">${selectedDoctor.fee}</Text>
          </View>

          <Button 
            title="Confirm Booking" 
            onPress={handleBook}
            disabled={!selectedTime}
          />
        </ScrollView>

        <Modal visible={showConfirmModal} animationType="slide" transparent>
          <View className="flex-1 bg-black/50 justify-end">
            <View 
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
              className="rounded-t-3xl bg-white p-6"
            >
              <View className="mb-6 items-center">
                <View className="mb-4 rounded-full bg-teal-50 p-4 border border-teal-100">
                  <CheckCircle2 size={44} color="#0d9488" />
                </View>
                <Text className="mb-2 font-inter-bold text-2xl text-charcoal">Booking Confirmed!</Text>
                <Text className="text-center font-inter text-sm text-muted leading-relaxed">
                  Your appointment with {selectedDoctor.name} is successfully scheduled for Today at {selectedTime}.
                </Text>
              </View>
              <Button title="View My Appointments" onPress={handleFinish} />
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Find a Doctor" />

      <ScrollView 
        contentContainerStyle={{ 
          padding: 20,
          paddingBottom: Math.max(insets.bottom, 20)
        }} 
        className="bg-slate-50"
        showsVerticalScrollIndicator={false}
      >
        <View className="space-y-4">
          {DOCTORS.map((doctor) => (
            <Pressable 
              key={doctor.id} 
              onPress={() => setSelectedDoctor(doctor)}
            >
              {({ pressed }) => (
                <Card className={`flex-row items-center gap-4 border border-slate-100 ${pressed ? 'bg-slate-50' : 'bg-white'}`}>
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-teal-50 border border-teal-100">
                    <Text className="font-inter-semibold text-base text-teal-600">
                      {doctor.name.split(' ').map((namePart) => namePart[0]).join('').slice(0, 3)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-start justify-between">
                      <View>
                        <Text className="font-inter-bold text-charcoal text-base">{doctor.name}</Text>
                        <Text className="font-inter text-xs text-muted mb-1">{doctor.specialty}</Text>
                      </View>
                      <Text className="font-inter-bold text-teal-600 text-base">${doctor.fee}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color="#eab308" fill="#eab308" />
                      <Text className="font-inter-medium text-xs text-charcoal">{doctor.rating}</Text>
                      <Text className="font-inter text-[10px] text-muted">({doctor.reviews} reviews)</Text>
                    </View>
                  </View>
                </Card>
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
