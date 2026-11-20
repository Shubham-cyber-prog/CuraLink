import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Clock,
  Globe,
  Check,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocation, type UserLocation } from '../lib/location-context';
import { useTheme } from '../lib/theme-context';

const POPULAR_INDIAN_CITIES: UserLocation[] = [
  { area: 'New Delhi', city: 'New Delhi', state: 'Delhi', pincode: '110001', fullAddress: 'New Delhi, Delhi', source: 'city' },
  { area: 'Gurugram', city: 'Gurugram', state: 'Haryana', pincode: '122001', fullAddress: 'Gurugram, Haryana', source: 'city' },
  { area: 'Noida', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', fullAddress: 'Noida, Uttar Pradesh', source: 'city' },
  { area: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', fullAddress: 'Mumbai, Maharashtra', source: 'city' },
  { area: 'Bengaluru', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', fullAddress: 'Bengaluru, Karnataka', source: 'city' },
  { area: 'Hisar', city: 'Hisar', state: 'Haryana', pincode: '125001', fullAddress: 'Hisar, Haryana', source: 'city' },
  { area: 'Chandigarh', city: 'Chandigarh', state: 'Punjab', pincode: '160017', fullAddress: 'Chandigarh, Punjab', source: 'city' },
  { area: 'Jaipur', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', fullAddress: 'Jaipur, Rajasthan', source: 'city' },
  { area: 'Hyderabad', city: 'Hyderabad', state: 'Telangana', pincode: '500001', fullAddress: 'Hyderabad, Telangana', source: 'city' },
  { area: 'Pune', city: 'Pune', state: 'Maharashtra', pincode: '411001', fullAddress: 'Pune, Maharashtra', source: 'city' },
  { area: 'Kolkata', city: 'Kolkata', state: 'West Bengal', pincode: '700001', fullAddress: 'Kolkata, West Bengal', source: 'city' },
  { area: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', fullAddress: 'Chennai, Tamil Nadu', source: 'city' },
];

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LocationPickerModal({ visible, onClose }: LocationPickerModalProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const {
    location,
    recentLocations,
    isDetecting,
    locationError,
    setLocation,
    setAllIndiaMode,
    detectCurrentLocation,
    searchLocations,
    clearError,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserLocation[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      clearError();
    }
  }, [visible, clearError]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const hits = await searchLocations(trimmed);
      setResults(hits);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchLocations]);

  const handleUseGps = async () => {
    const detected = await detectCurrentLocation();
    if (detected) {
      onClose();
    }
  };

  const handleSelect = async (loc: UserLocation) => {
    await setLocation(loc);
    onClose();
  };

  const handleSelectAllIndia = async () => {
    await setAllIndiaMode();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          className="h-[88%] rounded-t-[32px] bg-white dark:bg-[#071320] overflow-hidden border-t border-[#E6ECEF] dark:border-[#163656]"
        >
          {/* Sheet Handle */}
          <View className="items-center pt-3 pb-1">
            <View className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
          </View>

          {/* Sheet Header */}
          <View className="flex-row items-center justify-between px-5 pt-3 pb-3.5 border-b border-[#E6ECEF] dark:border-[#163656]">
            <View>
              <Text className="font-inter-bold text-lg text-[#0B1F33] dark:text-white">Choose your location</Text>
              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400">
                Discover nearby verified clinics &amp; 24×7 telehealth doctors
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F4F7F8] dark:bg-[#112A44]"
            >
              <X size={18} color={isDark ? '#F3F7F9' : '#0B1F33'} />
            </Pressable>
          </View>

          {/* Search Input (Swiggy / Zomato Style) */}
          <View className="px-5 pt-4 pb-3">
            <View className="flex-row items-center rounded-2xl border border-[#DCE5E9] dark:border-[#163656] bg-[#F6F8F9] dark:bg-[#0B1F33] px-3.5 py-3">
              <Search size={18} color="#006D77" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search sector, colony, city or 6-digit pincode..."
                placeholderTextColor="#94A3B8"
                autoFocus={false}
                className="flex-1 ml-2.5 font-inter text-sm text-[#0B1F33] dark:text-white py-0"
              />
              {searching ? (
                <ActivityIndicator size="small" color="#006D77" />
              ) : query.length > 0 ? (
                <Pressable onPress={() => setQuery('')}>
                  <X size={16} color="#64748B" />
                </Pressable>
              ) : null}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28, gap: 14 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Error Banner with Retry */}
            {locationError ? (
              <View className="flex-row items-start justify-between gap-2.5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3.5">
                <View className="flex-row items-start gap-2 flex-1">
                  <AlertCircle size={16} color="#D97706" style={{ marginTop: 2 }} />
                  <Text className="flex-1 font-inter text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {locationError}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleUseGps}
                  className="rounded-lg bg-amber-600 px-2.5 py-1 flex-row items-center gap-1 self-start"
                >
                  <RefreshCw size={11} color="#FFFFFF" />
                  <Text className="font-inter-semibold text-[11px] text-white">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Live Autocomplete Search Results */}
            {query.trim().length >= 2 ? (
              <View className="rounded-2xl border border-[#E6ECEF] dark:border-[#163656] bg-white dark:bg-[#0B1F33] overflow-hidden">
                {searching ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#006D77" />
                    <Text className="font-inter text-xs text-slate-500 mt-2">Searching Indian localities...</Text>
                  </View>
                ) : results.length === 0 ? (
                  <View className="py-8 px-4 items-center">
                    <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white">No matching localities</Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
                      Try typing a city name, sector, or 6-digit Indian postal pincode.
                    </Text>
                  </View>
                ) : (
                  results.map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.area}-${item.city}-${idx}`}
                      onPress={() => handleSelect(item)}
                      activeOpacity={0.7}
                      className={`flex-row items-center gap-3 px-4 py-3.5 ${
                        idx < results.length - 1 ? 'border-b border-[#EDF3F4] dark:border-[#163656]' : ''
                      }`}
                    >
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#EAF4F5] dark:bg-[#112A44]">
                        <MapPin size={16} color={isDark ? '#83C5BE' : '#006D77'} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white" numberOfLines={1}>
                          {item.area}
                        </Text>
                        <Text className="font-inter text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
                          {item.fullAddress}
                        </Text>
                      </View>
                      <ChevronRight size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  ))
                )}
              </View>
            ) : (
              <>
                {/* 1. Live GPS Location Button */}
                <TouchableOpacity
                  onPress={handleUseGps}
                  disabled={isDetecting}
                  activeOpacity={0.75}
                  className="flex-row items-center gap-3.5 rounded-2xl border border-[#006D77]/30 dark:border-[#83C5BE]/30 bg-[#EAF4F5]/70 dark:bg-[#112A44] p-4"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#006D77]">
                    {isDetecting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Navigation size={19} color="#FFFFFF" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-sm text-[#006D77] dark:text-[#83C5BE]">
                      {isDetecting ? 'Detecting your live GPS position...' : 'Use current location (GPS)'}
                    </Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-300 mt-0.5">
                      Accurate sector, city &amp; nearby verified clinics
                    </Text>
                  </View>
                  <ChevronRight size={17} color={isDark ? '#83C5BE' : '#006D77'} />
                </TouchableOpacity>

                {/* 2. All India Telehealth Option */}
                <TouchableOpacity
                  onPress={handleSelectAllIndia}
                  activeOpacity={0.75}
                  className={`flex-row items-center gap-3.5 rounded-2xl border p-4 ${
                    location.isAllIndia
                      ? 'border-[#006D77] bg-[#EAF4F5]/50 dark:bg-[#112A44]'
                      : 'border-[#E6ECEF] dark:border-[#163656] bg-white dark:bg-[#0B1F33]'
                  }`}
                >
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44]">
                    <Globe size={19} color={isDark ? '#83C5BE' : '#006D77'} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">
                      All India (24×7 Video Telehealth)
                    </Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Consult all board-certified doctors nationwide
                    </Text>
                  </View>
                  {location.isAllIndia && <Check size={18} color={isDark ? '#83C5BE' : '#006D77'} />}
                </TouchableOpacity>

                {/* 3. Recent Locations */}
                {recentLocations.length > 0 && (
                  <View className="space-y-2">
                    <Text className="font-inter-bold text-[11px] uppercase tracking-wider text-slate-400">
                      Recent Locations
                    </Text>
                    <View className="rounded-2xl border border-[#E6ECEF] dark:border-[#163656] bg-white dark:bg-[#0B1F33] overflow-hidden">
                      {recentLocations.map((rec, idx) => {
                        const isCurrent =
                          !location.isAllIndia &&
                          location.area.toLowerCase() === rec.area.toLowerCase() &&
                          location.city.toLowerCase() === rec.city.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={`${rec.area}-${rec.city}-${idx}`}
                            onPress={() => handleSelect(rec)}
                            activeOpacity={0.7}
                            className={`flex-row items-center gap-3 px-4 py-3.5 ${
                              idx < recentLocations.length - 1 ? 'border-b border-[#EDF3F4] dark:border-[#163656]' : ''
                            }`}
                          >
                            <Clock size={16} color="#64748B" />
                            <View className="flex-1">
                              <Text className="font-inter-semibold text-sm text-[#0B1F33] dark:text-white" numberOfLines={1}>
                                {rec.area}
                              </Text>
                              <Text className="font-inter text-xs text-slate-500 dark:text-slate-400" numberOfLines={1}>
                                {rec.fullAddress}
                              </Text>
                            </View>
                            {isCurrent && <Check size={16} color="#006D77" />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 4. Popular Cities */}
                <View className="space-y-2.5">
                  <Text className="font-inter-bold text-[11px] uppercase tracking-wider text-slate-400">
                    Popular Indian Cities
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {POPULAR_INDIAN_CITIES.map((c) => {
                      const active = !location.isAllIndia && location.city.toLowerCase() === c.city.toLowerCase();
                      return (
                        <Pressable
                          key={c.city}
                          onPress={() => handleSelect(c)}
                          className={`rounded-full px-4 py-2 border flex-row items-center gap-1.5 ${
                            active
                              ? 'bg-[#006D77] border-[#006D77]'
                              : 'bg-[#F6F8F9] dark:bg-[#0B1F33] border-[#E6ECEF] dark:border-[#163656]'
                          }`}
                        >
                          <MapPin size={12} color={active ? '#FFFFFF' : '#64748B'} />
                          <Text
                            className={`font-inter-semibold text-xs ${
                              active ? 'text-white' : 'text-[#0B1F33] dark:text-slate-200'
                            }`}
                          >
                            {c.city}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
