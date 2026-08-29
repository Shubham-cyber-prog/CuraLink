import React from 'react';
import { Text, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DoctorsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-5 pt-5">
        <Text className="font-inter-bold text-[28px] text-charcoal">Find a doctor</Text>
        <Text className="mt-2 font-inter text-base text-muted">Search by specialty, location, or availability.</Text>
        <View className="mt-8 items-center rounded-2xl bg-white px-6 py-10 shadow-sm shadow-slate-200">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-teal-50">
            <Search color="#0D9488" size={22} />
          </View>
          <Text className="mt-4 font-inter-semibold text-base text-charcoal">Doctor search is next</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
