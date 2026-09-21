import React, { useEffect, useState } from 'react';
import { View, Text, Animated, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Bot, CalendarCheck, MessageCircle } from 'lucide-react-native';
import { Button } from '../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import logoImg from '../../assets/images/logo.png';

export default function OnboardingScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(20));

  useEffect(() => {
    // Staged animation: fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={['#F0FDFA', '#FFFFFF', '#FFFFFF']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Area */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim, 
              transform: [{ translateY: slideAnim }],
              alignItems: 'center', 
              marginTop: 40 
            }}
          >
            {/* CuraLink Logo (clean transparent mark) */}
            <View className="mb-4 h-24 w-24 items-center justify-center">
              <Image
                source={logoImg}
                style={{ width: 88, height: 88 }}
                resizeMode="contain"
                alt="CuraLink Logo"
              />
            </View>

            <Text className="font-inter-bold text-center text-4xl tracking-tight text-charcoal">
              Cura<Text className="text-teal-600">Link</Text>
            </Text>
            
            <Text className="mt-3 max-w-[280px] text-center font-inter text-base leading-relaxed text-muted">
              Clinical precision. Secure communication. AI-powered care.
            </Text>
          </Animated.View>

          {/* Features Highlights */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginVertical: 32
            }}
            className="space-y-6"
          >
            {/* Feature 1 */}
            <View className="flex-row items-start gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                <Bot size={22} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-charcoal text-base">
                  AI Symptom Checker
                </Text>
                <Text className="font-inter text-muted text-sm mt-1 leading-relaxed">
                  Describe what you&apos;re feeling for immediate, clinical-grade guidance.
                </Text>
              </View>
            </View>

            {/* Feature 2 */}
            <View className="flex-row items-start gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                <CalendarCheck size={22} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-charcoal text-base">
                  Instant Booking
                </Text>
                <Text className="font-inter text-muted text-sm mt-1 leading-relaxed">
                  Schedule consultations with verified specialists in just a few taps.
                </Text>
              </View>
            </View>

            {/* Feature 3 */}
            <View className="flex-row items-start gap-4 rounded-2xl border border-slate-100 bg-white/80 p-5 shadow-sm">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-teal-50">
                <MessageCircle size={22} color="#0d9488" />
              </View>
              <View className="flex-1">
                <Text className="font-inter-semibold text-charcoal text-base">
                  Secure Consultation Chat
                </Text>
                <Text className="font-inter text-muted text-sm mt-1 leading-relaxed">
                  End-to-end encrypted messaging directly with your physician.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View 
            style={{ 
              opacity: fadeAnim,
              width: '100%',
              gap: 12
            }}
          >
            <Button 
              title="Create Account" 
              onPress={() => router.push('/(auth)/register')}
              className="w-full shadow-sm"
            />
            <Button 
              title="Sign In" 
              variant="outline"
              onPress={() => router.push('/(auth)/login')}
              className="w-full"
            />
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
