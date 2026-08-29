import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { CalendarDays, Star } from 'lucide-react-native';
import type { DoctorPreview } from '../../types/healthcare';

interface DoctorRecommendationCardProps {
  doctor: DoctorPreview;
  onPress: () => void;
}

export function DoctorRecommendationCard({ doctor, onPress }: DoctorRecommendationCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${doctor.name}`}
      className="mr-4 w-64"
      onPress={onPress}
    >
      {({ pressed }) => (
        <View className={`overflow-hidden rounded-2xl bg-white shadow-sm shadow-slate-200 ${pressed ? 'opacity-90' : ''}`}>
          <Image
            accessibilityLabel={`${doctor.name} profile photo`}
            alt={`${doctor.name} profile photo`}
            source={{ uri: doctor.photoUrl }}
            style={{ height: 132, width: '100%' }}
          />
          <View className="p-4">
            <Text className="font-inter-semibold text-base text-charcoal" numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text className="mt-1 font-inter text-sm text-muted" numberOfLines={1}>
              {doctor.specialty}
            </Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Star color="#F59E0B" fill="#F59E0B" size={15} />
                <Text className="ml-1 font-inter-semibold text-xs text-charcoal">
                  {doctor.rating.toFixed(1)}
                </Text>
                <Text className="ml-1 font-inter text-xs text-muted">({doctor.reviewCount})</Text>
              </View>
              <View className="flex-row items-center">
                <CalendarDays color="#0D9488" size={14} />
                <Text className="ml-1 font-inter-medium text-xs text-teal-700">{doctor.nextAvailableLabel}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}
