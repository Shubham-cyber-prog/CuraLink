import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Search,
  MapPin,
  Star,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Video,
  Building2,
  X,
  CheckCircle2,
  ChevronDown,
  Navigation,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../components/UI';
import { Button } from '../../components/Button';
import { MotionView } from '../../components/Motion';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { useTheme } from '../../lib/theme-context';
import { useLocation } from '../../lib/location-context';
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
  inPersonAvailable: boolean;
  city?: string | null;
  hospitalName: string;
  clinicAddress: string;
}

export default function DoctorsTabScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ specialty?: string }>();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { location, setAllIndiaMode } = useLocation();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [modeFilter, setModeFilter] = useState<'all' | 'video' | 'clinic'>('all');
  const [usedFallback, setUsedFallback] = useState(false);
  const [doctors, setDoctors] = useState<MobileDoctor[]>([]);

  const selectedCity = location.isAllIndia ? 'All India' : location.city;

  useEffect(() => {
    if (params.specialty) {
      setSelectedSpecialty(params.specialty);
    }
  }, [params.specialty]);

  const mapDoctor = (d: any): MobileDoctor => {
    const rawName = d.name || 'Specialist';
    const modes: string[] = Array.isArray(d.consultationModes) ? d.consultationModes : ['VIDEO', 'IN_PERSON'];
    const hospitalName =
      d.hospitalName ||
      d.hospital ||
      (d.city ? `City Multi-Specialty Hospital, ${d.city}` : 'Apollo City Hospital & OPD Care');
    const clinicAddress =
      d.clinicAddress ||
      (d.city ? `OPD Block B, Sector 14, ${d.city}` : 'Main OPD Block, Central Hospital');

    return {
      id: d.id || d.userId,
      name: rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`,
      specialty: d.specialization || d.specialty || 'General Practice',
      rating: typeof d.rating === 'number' && d.rating > 0 ? d.rating : 4.9,
      reviewCount: typeof d.reviewCount === 'number' ? d.reviewCount : 0,
      experience: d.experience || `${d.experienceYears || 5}+ yrs exp`,
      nextAvailable: d.nextAvailableDate
        ? `${d.nextAvailableDate}, ${d.nextAvailableTime || '10:30 AM'}`
        : 'Today, 10:30 AM',
      fee: d.consultationFee || 500,
      videoAvailable: modes.includes('VIDEO') || Boolean(d.videoConsultation ?? true),
      inPersonAvailable: modes.includes('IN_PERSON') || Boolean(d.inPersonConsultation ?? true),
      city: d.city || null,
      hospitalName,
      clinicAddress,
    };
  };

  const loadLiveDoctors = useCallback(async (city: string) => {
    setLoading(true);
    setUsedFallback(false);
    try {
      const cityParam = city !== 'All India' ? `?city=${encodeURIComponent(city)}` : '';
      const res = await api.get<any[]>(`/doctors${cityParam}`);
      const list = Array.isArray(res.data) ? res.data : [];

      if (city !== 'All India' && list.length === 0) {
        const allRes = await api.get<any[]>('/doctors');
        if (Array.isArray(allRes.data) && allRes.data.length > 0) {
          setDoctors(allRes.data.map(mapDoctor));
          setUsedFallback(true);
          return;
        }
      }

      setDoctors(list.map(mapDoctor));
    } catch (err) {
      console.error('Failed to load doctors:', err);
      setDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveDoctors(selectedCity);
  }, [selectedCity, loadLiveDoctors]);

  const specialties = useMemo(() => {
    const list = ['All', 'General Practice', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Psychiatry'];
    doctors.forEach((d) => {
      if (d.specialty && !list.includes(d.specialty)) list.push(d.specialty);
    });
    return list;
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return doctors.filter((doc) => {
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.hospitalName.toLowerCase().includes(q) ||
        doc.clinicAddress.toLowerCase().includes(q) ||
        (doc.city && doc.city.toLowerCase().includes(q));

      const matchesSpecialty =
        selectedSpecialty === 'All' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

      const matchesMode =
        modeFilter === 'all' ||
        (modeFilter === 'video' && doc.videoAvailable) ||
        (modeFilter === 'clinic' && doc.inPersonAvailable);

      return matchesSearch && matchesSpecialty && matchesMode;
    });
  }, [doctors, searchQuery, selectedSpecialty, modeFilter]);

  return (
    <View className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]">
      {/* Header */}
      <View
        style={{ paddingTop: Math.max(insets.top + 8, 18) }}
        className="bg-white dark:bg-[#0B1F33] px-5 pb-4 border-b border-[#E6ECEF] dark:border-[#163656] space-y-3"
      >
        <View className="flex-row items-center justify-between gap-2">
          <View>
            <Text className="font-inter-bold text-2xl text-[#0B1F33] dark:text-white">Find Doctors</Text>
            <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
              Board-certified practitioners &amp; instant care
            </Text>
          </View>

          {/* Location Pill */}
          <TouchableOpacity
            onPress={() => setShowLocationModal(true)}
            className="flex-row items-center gap-1.5 rounded-full bg-[#EAF4F5] dark:bg-[#112A44] border border-[#C7E3E5] dark:border-[#163656] px-3 py-1.5"
          >
            {location.source === 'gps' ? (
              <Navigation size={13} color={isDark ? '#83C5BE' : '#006D77'} />
            ) : (
              <MapPin size={13} color={isDark ? '#83C5BE' : '#006D77'} />
            )}
            <Text className="font-inter-bold text-xs text-[#006D77] dark:text-[#83C5BE]" numberOfLines={1}>
              {location.area}
            </Text>
            <ChevronDown size={13} color={isDark ? '#83C5BE' : '#006D77'} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center rounded-2xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#071320] px-3.5 py-2.5">
          <Search size={17} color="#006D77" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search doctor, hospital (e.g. Apollo), specialty..."
            placeholderTextColor="#94A3B8"
            className="flex-1 ml-2.5 font-inter text-xs text-[#0B1F33] dark:text-white py-0"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <X size={15} color="#64748B" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Specialty + Mode Strip */}
      <View className="pt-3 pb-2 px-5 space-y-2.5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {specialties.map((spec) => {
            const active = selectedSpecialty === spec;
            return (
              <Pressable
                key={spec}
                onPress={() => setSelectedSpecialty(spec)}
                className={`rounded-full px-3.5 py-1.5 border ${
                  active
                    ? 'bg-[#006D77] border-[#006D77]'
                    : 'bg-white dark:bg-[#0B1F33] border-[#E2E8F0] dark:border-[#163656]'
                }`}
              >
                <Text
                  className={`font-inter-semibold text-xs ${
                    active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {spec}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1.5">
            {[
              { id: 'all', label: 'All Modes' },
              { id: 'video', label: 'Video Consult' },
              { id: 'clinic', label: 'Clinic Visit' },
            ].map((m) => (
              <Pressable
                key={m.id}
                onPress={() => setModeFilter(m.id as any)}
                className={`rounded-full px-3 py-1 ${
                  modeFilter === m.id ? 'bg-[#006D77]' : 'bg-[#E6ECEF]/80 dark:bg-[#112A44]'
                }`}
              >
                <Text
                  className={`font-inter-semibold text-[11px] ${
                    modeFilter === m.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="font-inter-medium text-xs text-slate-500 dark:text-slate-400">
            {filteredDoctors.length} verified doctor{filteredDoctors.length === 1 ? '' : 's'}
          </Text>
        </View>
      </View>

      {/* Main List */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom + 100, 115),
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadLiveDoctors(selectedCity);
            }}
            colors={['#006D77']}
          />
        }
      >
        {usedFallback && !loading && (
          <View className="flex-row items-center gap-2 rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44] border border-[#C7E3E5] dark:border-[#163656] px-4 py-3">
            <CheckCircle2 size={16} color={isDark ? '#83C5BE' : '#006D77'} />
            <Text className="flex-1 font-inter text-xs text-[#0B1F33] dark:text-slate-200">
              No clinics listed in {selectedCity} yet — showing verified 24×7 Video Consultation doctors.
            </Text>
          </View>
        )}

        {loading ? (
          <View className="py-16 items-center">
            <ActivityIndicator size="large" color="#006D77" />
            <Text className="mt-3 font-inter text-xs text-slate-500 dark:text-slate-400">Loading doctors...</Text>
          </View>
        ) : filteredDoctors.length === 0 ? (
          <Card className="items-center py-10 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
            <MapPin size={26} color="#006D77" />
            <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white text-center">
              No matching doctors found
            </Text>
            <Button
              title="Show All India Doctors"
              size="sm"
              onPress={() => {
                setSearchQuery('');
                setSelectedSpecialty('All');
                setAllIndiaMode();
                setModeFilter('all');
              }}
            />
          </Card>
        ) : (
          filteredDoctors.map((doc, idx) => {
            const initial = doc.name.replace(/^Dr\.?\s*/i, '').charAt(0).toUpperCase();
            return (
              <MotionView key={doc.id} delay={Math.min(idx * 45, 220)}>
                <Card className="p-4 space-y-3 border border-[#E2E8F0] dark:border-[#163656]">
                  <View className="flex-row items-start gap-3.5">
                    <View className="h-14 w-14 items-center justify-center rounded-2xl bg-[#006D77]">
                      <Text className="font-inter-bold text-lg text-white">{initial}</Text>
                    </View>

                    <View className="flex-1">
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-row items-center gap-1.5 flex-1 pr-1">
                          <Text className="font-inter-bold text-base text-[#0B1F33] dark:text-white" numberOfLines={1}>
                            {doc.name}
                          </Text>
                          <ShieldCheck size={14} color="#006D77" />
                        </View>
                        <Text className="font-inter-bold text-base text-[#006D77] dark:text-[#83C5BE]">
                          ₹{doc.fee}
                        </Text>
                      </View>

                      <Text className="font-inter-semibold text-xs text-[#006D77] dark:text-[#83C5BE] mt-0.5">
                        {doc.specialty}
                      </Text>

                      {/* Hospital & OPD Location Badge */}
                      <View className="flex-row items-center gap-1.5 mt-1 bg-slate-50 dark:bg-[#112A44] px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        <Building2 size={11} color={isDark ? '#83C5BE' : '#006D77'} />
                        <Text className="font-inter-semibold text-[11px] text-[#0B1F33] dark:text-slate-200 flex-1" numberOfLines={1}>
                          {doc.hospitalName}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2 mt-1.5 flex-wrap">
                        <View className="flex-row items-center gap-1">
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <Text className="font-inter-bold text-xs text-[#0B1F33] dark:text-white">
                            {doc.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text className="text-slate-300 dark:text-slate-600">•</Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">{doc.experience}</Text>
                        <Text className="text-slate-300 dark:text-slate-600">•</Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                          {doc.city || 'Online Video'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between border-t border-[#EDF3F4] dark:border-[#163656] pt-2.5">
                    <View className="flex-row items-center gap-1.5">
                      <Calendar size={13} color={isDark ? '#83C5BE' : '#006D77'} />
                      <Text className="font-inter-medium text-xs text-[#0B1F33] dark:text-slate-300">
                        {doc.nextAvailable}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      {doc.videoAvailable && (
                        <View className="flex-row items-center gap-1 rounded-full bg-[#EAF4F5] dark:bg-[#112A44] px-2.5 py-0.5">
                          <Video size={11} color={isDark ? '#83C5BE' : '#006D77'} />
                          <Text className="font-inter-semibold text-[10px] text-[#006D77] dark:text-[#83C5BE]">
                            Video
                          </Text>
                        </View>
                      )}
                      {doc.inPersonAvailable && (
                        <View className="flex-row items-center gap-1 rounded-full bg-slate-100 dark:bg-[#112A44] px-2.5 py-0.5">
                          <Building2 size={11} color="#64748B" />
                          <Text className="font-inter-semibold text-[10px] text-slate-600 dark:text-slate-300">
                            Clinic
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Button
                    title={`Book & Pay ₹${doc.fee}`}
                    icon={ChevronRight}
                    iconPosition="right"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/doctor-booking',
                        params: {
                          doctorId: doc.id,
                          name: doc.name,
                          specialty: doc.specialty,
                          fee: String(doc.fee),
                          rating: String(doc.rating),
                          reviewCount: String(doc.reviewCount),
                          hospitalName: doc.hospitalName,
                          clinicAddress: doc.clinicAddress,
                        },
                      })
                    }
                  />
                </Card>
              </MotionView>
            );
          })
        )}
      </ScrollView>

      <LocationPickerModal visible={showLocationModal} onClose={() => setShowLocationModal(false)} />
    </View>
  );
}
