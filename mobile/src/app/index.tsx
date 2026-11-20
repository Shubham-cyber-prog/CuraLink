import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, Video, ShieldCheck, ArrowRight, Sparkles, Heart } from 'lucide-react-native';
import { Button } from '../components/Button';
import { MotionView } from '../components/Motion';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../lib/theme-context';
import { CuraLinkLogo } from '../components/CuraLinkLogo';

const HIGHLIGHTS = [
  {
    icon: CalendarCheck,
    title: 'NMC Board-Certified Specialists',
    desc: 'Top doctors from AIIMS, Apollo, Fortis with proven clinical experience.',
  },
  {
    icon: Video,
    title: 'Instant 2-Minute HD Video Visits',
    desc: 'Consult top doctors 24×7 from ₹199 with encrypted end-to-end video.',
  },
  {
    icon: ShieldCheck,
    title: 'Digitally-Signed E-Prescriptions',
    desc: 'NMC-compliant digital Rx with instant medicine delivery & records vault.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-[#F6F8F9] dark:bg-[#071320]" edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          justifyContent: 'space-between',
          paddingTop: 36,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Real Logo Brand Header */}
        <MotionView delay={30} className="items-center">
          <View className="mb-4">
            <CuraLinkLogo size="lg" showSubtitle subtitle="India's #1 Rated Telehealth Platform" />
          </View>

          <Text className="mt-2 max-w-[310px] text-center font-inter text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            India's most trusted healthcare ecosystem — instant video consults, verified clinic visits, and digital medical records.
          </Text>
        </MotionView>

        {/* Feature Cards */}
        <View className="my-8 space-y-3.5">
          {HIGHLIGHTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <MotionView key={item.title} delay={90 + idx * 70}>
                <View className="flex-row items-center gap-4 rounded-3xl border border-[#E2E8F0] dark:border-[#163656] bg-white dark:bg-[#0B1F33] p-4 shadow-sm shadow-slate-100 dark:shadow-none">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF4F5] dark:bg-[#112A44]">
                    <Icon size={22} color={isDark ? '#83C5BE' : '#006D77'} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-sm text-[#0B1F33] dark:text-white">{item.title}</Text>
                    <Text className="font-inter text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </Text>
                  </View>
                </View>
              </MotionView>
            );
          })}
        </View>

        {/* Action Buttons */}
        <MotionView delay={300} className="w-full gap-3">
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/register')}
            icon={ArrowRight}
            iconPosition="right"
            className="w-full"
          />
          <Button
            title="Sign In to Existing Account"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            className="w-full"
          />
        </MotionView>
      </ScrollView>
    </SafeAreaView>
  );
}
