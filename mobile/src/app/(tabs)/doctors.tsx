import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star, Calendar, ShieldCheck, ChevronRight, Video, Sparkles, RefreshCw } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Badge } from '../../components/UI';
import { Button } from '../../components/Button';
import { api } from '../../lib/api';

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
  city?: string | null;
  location: string;
}

const POPULAR_CITIES = ['Hisar', 'New Delhi', 'Gurugram', 'Mumbai', 'Bengaluru', 'Jaipur', 'Chandigarh'];

export default function DoctorsTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('Hisar');
  const [filterByCity, setFilterByCity] = useState<boolean>(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState<MobileDoctor[]>([]);

  const loadLiveDoctors = useCallback(async (cityToQuery?: string, shouldFilter = filterByCity) => {
    setLoading(true);
    try {
      const cityParam = shouldFilter && cityToQuery && cityToQuery !== 'All' 
        ? `?city=${encodeURIComponent(cityToQuery)}` 
        : '';
      const res = await api.get<any>(`/doctors${cityParam}`);
      if (res.data && Array.isArray(res.data)) {
        const mapped: MobileDoctor[] = res.data.map((d: any) => ({
          id: d.id || d.userId,
          name: d.name || 'Dr. Specialist',
          specialty: d.specialization || d.specialty || 'General Practice',
          rating: typeof d.rating === 'number' ? d.rating : 4.9,
          reviewCount: typeof d.reviewCount === 'number' ? d.reviewCount : 12,
          experience: d.experience || `${d.experienceYears || 5}+ yrs exp`,
          nextAvailable: d.nextAvailableDate ? `${d.nextAvailableDate}, ${d.nextAvailableTime || '10:30 AM'}` : 'Today, 10:30 AM',
          fee: d.consultationFee || 500,
          videoAvailable: Boolean(d.videoConsultation ?? true),
          city: d.city || null,
          location: d.city ? `${d.city}, India` : 'CuraLink Telehealth',
        }));
        setDoctors(mapped);
      } else {
        setDoctors([]);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [filterByCity]);

  useEffect(() => {
    loadLiveDoctors(selectedCity, filterByCity);
  }, [selectedCity, filterByCity, loadLiveDoctors]);

  const specialties = useMemo(() => {
    const list = ['All'];
    doctors.forEach((d) => {
      if (d.specialty && !list.includes(d.specialty)) {
        list.push(d.specialty);
      }
    });
    return list;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.city && doc.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;

      return matchesSearch && matchesSpecialty;
    });
  }, [doctors, searchQuery, selectedSpecialty]);

  return (
    <View className="flex-1 bg-slate-50 dark:bg-[#0B1120]">
      {/* Fixed Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) }}
        className="bg-white dark:bg-[#151B2E] px-5 pb-3 border-b border-slate-100 dark:border-[#263049] space-y-3"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-bold text-2xl text-charcoal dark:text-[#F1F5F9]">Find a Specialist</Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400">
              {filterByCity ? `Clinicians near ${selectedCity}` : 'All nationwide clinicians'}
            </Text>
          </View>
          <Pressable
            onPress={() => setFilterByCity(!filterByCity)}
            className={`flex-row items-center gap-1 px-3 py-1.5 rounded-full border ${
              filterByCity
                ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800/60'
                : 'bg-slate-100 dark:bg-[#1C2338] border-slate-200 dark:border-[#263049]'
            }`}
          >
            <MapPin size={13} color={filterByCity ? '#0D9488' : '#94A3B8'} />
            <Text
              className={`font-inter-medium text-xs ${
                filterByCity ? 'text-teal-800 dark:text-teal-300' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {filterByCity ? selectedCity : 'All Cities'}
            </Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-2xl border border-slate-200 dark:border-[#263049] bg-slate-50 dark:bg-[#1C2338] px-3.5 py-2.5">
          <Search size={18} color="#94A3B8" className="mr-2" />
          <TextInput
            placeholder="Search doctor, specialty, or city..."
            placeholderTextColor="#94A3B8"
            className="flex-1 font-inter text-sm text-charcoal dark:text-[#F1F5F9]"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* City Filter Horizontal Scroll */}
        <View className="space-y-1">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-1.5 items-center">
              <Pressable
                onPress={() => {
                  setFilterByCity(false);
                }}
                className={`rounded-full px-3 py-1.5 border flex-row items-center gap-1 ${
                  !filterByCity
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338]'
                }`}
              >
                <Sparkles size={11} color={!filterByCity ? '#FFF' : '#94A3B8'} />
                <Text
                  className={`font-inter-medium text-xs ${
                    !filterByCity ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All Cities
                </Text>
              </Pressable>

              {POPULAR_CITIES.map((c) => {
                const isSelected = filterByCity && selectedCity.toLowerCase() === c.toLowerCase();
                return (
                  <Pressable
                    key={c}
                    onPress={() => {
                      setSelectedCity(c);
                      setFilterByCity(true);
                    }}
                    className={`rounded-full px-3 py-1.5 border flex-row items-center gap-1 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600'
                        : 'border-slate-200 dark:border-[#263049] bg-white dark:bg-[#1C2338]'
                    }`}
                  >
                    <MapPin size={11} color={isSelected ? '#FFF' : '#94A3B8'} />
                    <Text
                      className={`font-inter-medium text-xs ${
                        isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {c}
                    </Text>
                  </Pressable>
                );
              })}

              {searchQuery.trim().length > 1 &&
                !POPULAR_CITIES.map((c) => c.toLowerCase()).includes(searchQuery.trim().toLowerCase()) && (
                  <Pressable
                    onPress={() => {
                      setSelectedCity(searchQuery.trim());
                      setFilterByCity(true);
                    }}
                    className="rounded-full px-3 py-1.5 border border-dashed border-teal-600 bg-teal-50 dark:bg-teal-950/40 flex-row items-center gap-1"
                  >
                    <MapPin size={11} color="#0D9488" />
                    <Text className="font-inter-medium text-xs text-teal-800 dark:text-teal-300">
                      Filter by &quot;{searchQuery.trim()}&quot;
                    </Text>
                  </Pressable>
                )}
            </View>
          </ScrollView>

          {/* Specialty Filter Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-1">
            <View className="flex-row gap-1.5">
              {specialties.map((spec) => (
                <Pressable
                  key={spec}
                  onPress={() => setSelectedSpecialty(spec)}
                  className={`rounded-full px-3 py-1 border ${
                    selectedSpecialty === spec
                      ? 'border-slate-800 bg-slate-800 dark:border-slate-200 dark:bg-slate-200'
                      : 'border-slate-200 dark:border-[#263049] bg-slate-100 dark:bg-[#151B2E]'
                  }`}
                >
                  <Text
                    className={`font-inter-medium text-[11px] ${
                      selectedSpecialty === spec
                        ? 'text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {spec}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Main Content List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 90, 100),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Text className="font-inter-semibold text-xs text-muted dark:text-slate-400">
            {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available
            {filterByCity ? ` in ${selectedCity}` : ' nationwide'}
          </Text>
          <View className="flex-row items-center gap-1">
            <ShieldCheck size={13} color="#0D9488" />
            <Text className="font-inter text-[11px] text-teal-700 dark:text-teal-400">Verified Board Licenses</Text>
          </View>
        </View>

        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#0D9488" />
            <Text className="mt-3 font-inter text-xs text-muted dark:text-slate-400">Loading verified doctors...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <Card className="items-center py-10 border border-slate-100 dark:border-[#263049] bg-white dark:bg-[#151B2E] space-y-3">
            <View className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/40 items-center justify-center">
              <MapPin size={24} color="#D97706" />
            </View>
            <Text className="font-inter-bold text-base text-charcoal dark:text-[#F1F5F9] text-center">
              {filterByCity ? `No doctors found in ${selectedCity} yet` : 'No doctors found'}
            </Text>
            <Text className="font-inter text-xs text-muted dark:text-slate-400 text-center px-4 leading-relaxed">
              {filterByCity
                ? `We do not have clinicians registered in ${selectedCity} yet. Try selecting a nearby city or browse nationwide telehealth doctors.`
                : 'Try adjusting your search criteria or resetting filters.'}
            </Text>
            <View className="flex-row gap-2 pt-1">
              {filterByCity && (
                <Pressable
                  onPress={() => setFilterByCity(false)}
                  className="px-4 py-2 rounded-xl bg-teal-600 active:bg-teal-700"
                >
                  <Text className="font-inter-semibold text-xs text-white">Show All Cities</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('All');
                  setFilterByCity(false);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              >
                <Text className="font-inter-semibold text-xs text-slate-700 dark:text-slate-300">Reset Filters</Text>
              </Pressable>
            </View>
          </Card>
        ) : (
          <View className="space-y-3.5">
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
                      <Text className="font-inter-bold text-teal-700 dark:text-teal-400 text-sm">₹{doc.fee}</Text>
                    </View>
                    <Text className="font-inter text-xs text-teal-800 dark:text-teal-300 font-inter-medium">{doc.specialty}</Text>

                    <View className="flex-row items-center gap-1.5 mt-1">
                      <MapPin size={12} color="#0D9488" />
                      <Text className="font-inter text-[11px] text-teal-700 dark:text-teal-400 font-inter-medium">
                        {doc.city ? `Clinic in ${doc.city}` : 'Telehealth Nationwide'}
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-2 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Star size={12} color="#EAB308" fill="#EAB308" />
                        <Text className="font-inter-bold text-xs text-charcoal dark:text-[#F1F5F9]">{doc.rating}</Text>
                        <Text className="font-inter text-xs text-muted dark:text-slate-400">({doc.reviewCount})</Text>
                      </View>
                      <Text className="font-inter text-xs text-slate-300 dark:text-slate-600">•</Text>
                      <Text className="font-inter text-xs text-muted dark:text-slate-400">{doc.experience}</Text>
                    </View>
                  </View>
                </View>

                {/* Details Footer */}
                <View className="border-t border-slate-100 dark:border-[#263049] pt-2.5 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-1.5">
                    <Calendar size={13} color="#0D9488" />
                    <Text className="font-inter-medium text-xs text-teal-700 dark:text-teal-400">{doc.nextAvailable}</Text>
                  </View>
                  {doc.videoAvailable && (
                    <View className="flex-row items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      <Video size={11} color="#059669" />
                      <Text className="font-inter-medium text-[10px] text-emerald-700 dark:text-emerald-400">Video Call</Text>
                    </View>
                  )}
                </View>

                <Button
                  title="Book Appointment"
                  onPress={() =>
                    router.push({
                      pathname: '/doctor-booking',
                      params: {
                        doctorId: doc.id,
                        name: doc.name,
                        specialty: doc.specialty,
                        fee: doc.fee.toString(),
                        rating: doc.rating.toString(),
                        reviewCount: doc.reviewCount.toString(),
                      },
                    })
                  }
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

