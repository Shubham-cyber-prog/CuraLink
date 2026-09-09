import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Calendar, ShieldCheck, ChevronRight, Video } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';

export interface MobileDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: string;
  nextAvailable: string;
  fee: number;
  videoAvailable: boolean;
  location: string;
}

const DOCTORS_LIST: MobileDoctor[] = [
  {
    id: 'doc_1',
    name: 'Dr. Priya Sharma',
    specialty: 'General Practice',
    rating: 4.9,
    reviewCount: 124,
    experience: '12+ yrs exp',
    nextAvailable: 'Today, 10:30 AM',
    fee: 90,
    videoAvailable: true,
    location: 'New York, NY',
  },
  {
    id: 'doc_2',
    name: 'Dr. Marcus Vance',
    specialty: 'Cardiology',
    rating: 4.8,
    reviewCount: 98,
    experience: '15+ yrs exp',
    nextAvailable: 'Tomorrow, 2:00 PM',
    fee: 150,
    videoAvailable: true,
    location: 'Boston, MA',
  },
  {
    id: 'doc_3',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Dermatology',
    rating: 4.95,
    reviewCount: 210,
    experience: '8+ yrs exp',
    nextAvailable: 'Today, 4:15 PM',
    fee: 140,
    videoAvailable: true,
    location: 'Chicago, IL',
  },
  {
    id: 'doc_4',
    name: 'Dr. Kenji Sato',
    specialty: 'Pediatrics',
    rating: 4.7,
    reviewCount: 85,
    experience: '10+ yrs exp',
    nextAvailable: 'Sep 1, 9:00 AM',
    fee: 110,
    videoAvailable: true,
    location: 'San Francisco, CA',
  },
  {
    id: 'doc_5',
    name: 'Dr. Elena Rostova',
    specialty: 'Neurology',
    rating: 4.6,
    reviewCount: 64,
    experience: '20+ yrs exp',
    nextAvailable: 'Sep 3, 11:30 AM',
    fee: 175,
    videoAvailable: false,
    location: 'Seattle, WA',
  },
  {
    id: 'doc_6',
    name: 'Dr. David Kim',
    specialty: 'General Practice',
    rating: 4.85,
    reviewCount: 152,
    experience: '5+ yrs exp',
    nextAvailable: 'Today, 1:45 PM',
    fee: 85,
    videoAvailable: true,
    location: 'Los Angeles, CA',
  },
];

const SPECIALTIES = ['All', 'General Practice', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology'];

export default function DoctorsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredDoctors = useMemo(() => {
    return DOCTORS_LIST.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [searchQuery, selectedSpecialty]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Fixed Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-4 border-b border-slate-100 dark:border-[#263049] space-y-3"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">Find a Specialist</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">Book verified doctors & telehealth visits</Text>
          </View>
          <View className="flex-row items-center gap-1 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-800/60">
            <MapPin size={14} color="#0D9488" />
            <Text className="font-inter-medium text-xs text-teal-800 dark:text-teal-300">Near You</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] px-3.5 py-2.5">
          <Search size={18} color="#94A3B8" className="mr-2" />
          <TextInput
            placeholder="Search doctor, specialty, or condition..."
            placeholderTextColor="#94A3B8"
            className="flex-1 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Specialty Filter Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-1">
          <View className="flex-row gap-2">
            {SPECIALTIES.map((spec) => (
              <Pressable
                key={spec}
                onPress={() => setSelectedSpecialty(spec)}
                className={`rounded-full px-4 py-2 border ${
                  selectedSpecialty === spec
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338]'
                }`}
              >
                <Text
                  className={`font-inter-medium text-xs ${
                    selectedSpecialty === spec ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {spec}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Main Content List */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-inter-semibold text-sm text-muted dark:text-slate-400">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available
          </Text>
          <View className="flex-row items-center gap-1">
            <ShieldCheck size={14} color="#0D9488" />
            <Text className="font-inter text-xs text-teal-700 dark:text-teal-400">Verified Board Licenses</Text>
          </View>
        </View>

        {filteredDoctors.length === 0 ? (
          <Card className="items-center py-10 border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E]">
            <Text className="font-inter-semibold text-base text-charcoal dark:text-[#F1F5F9] mb-1">No doctors found</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400 text-center px-4">
              Try adjusting your search criteria or changing specialty filter.
            </Text>
          </Card>
        ) : (
          <View className="space-y-4">
            {filteredDoctors.map((doc) => (
              <Card key={doc.id} className="border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] p-4 space-y-3">
                <View className="flex-row items-start gap-3">
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800/60">
                    <Text className="font-inter-bold text-lg text-teal-600 dark:text-teal-400">
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 3)}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-inter-bold text-base text-charcoal dark:text-[#F1F5F9]">{doc.name}</Text>
                      <Text className="font-inter-bold text-teal-700 dark:text-teal-400 text-sm">${doc.fee}</Text>
                    </View>
                    <Text className="font-inter text-xs text-teal-800 dark:text-teal-300 font-inter-medium">{doc.specialty}</Text>

                    <View className="flex-row items-center gap-2 mt-1.5">
                      <View className="flex-row items-center gap-1">
                        <Star size={13} color="#EAB308" fill="#EAB308" />
                        <Text className="font-inter-bold text-xs text-charcoal dark:text-[#F1F5F9]">{doc.rating}</Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400">({doc.reviewCount})</Text>
                      </View>
                      <Text className="font-inter text-xs text-slate-300 dark:text-slate-600">•</Text>
                      <Text className="font-inter text-xs text-muted dark:text-slate-400">{doc.experience}</Text>
                    </View>
                  </View>
                </View>

                {/* Details Footer */}
                <View className="border-t border-slate-100 dark:border-[#263049] pt-3 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Calendar size={14} color="#0D9488" />
                    <Text className="font-inter-medium text-xs text-teal-700 dark:text-teal-400">{doc.nextAvailable}</Text>
                  </View>
                  {doc.videoAvailable && (
                    <View className="flex-row items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      <Video size={12} color="#059669" />
                      <Text className="font-inter-medium text-[11px] text-emerald-700 dark:text-emerald-400">Video Call</Text>
                    </View>
                  )}
                </View>

                <Button
                  title="Book Appointment"
                  onPress={() => router.push('/doctor-booking')}
                  icon={ChevronRight}
                  iconPosition="right"
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
