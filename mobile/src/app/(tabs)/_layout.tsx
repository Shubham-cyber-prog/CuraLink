import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, Stethoscope, CalendarCheck, User, Bot } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0F9D8C', // CuraLink Primary Teal
        tabBarInactiveTintColor: '#64748B', // Slate-500
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10,
          marginTop: -2,
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
          tabBarIcon: ({ color, size }) => <Stethoscope size={22} color={color} />,
        }}
      />

      {/* Center Elevated Floating AI Button */}
      <Tabs.Screen
        name="symptom-checker"
        options={{
          title: 'AI Check',
          tabBarIcon: ({ color, focused }) => (
            <View className="-mt-6 h-12 w-12 items-center justify-center rounded-full bg-[#0F9D8C] shadow-lg shadow-[#0F9D8C]/40 border-4 border-[#F8FAFC]">
              <Bot size={24} color="#FFFFFF" />
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Inter_700Bold',
            fontSize: 10,
            color: '#0F9D8C',
            marginTop: 2,
            marginBottom: 4,
          },
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ color, size }) => <CalendarCheck size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={22} color={color} />,
        }}
      />

      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}
