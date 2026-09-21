import React from 'react';
import { Tabs } from 'expo-router';
import { CustomCurvedTabBar } from '../../components/CustomCurvedTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomCurvedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Doctors',
        }}
      />

      <Tabs.Screen
        name="symptom-checker"
        options={{
          title: 'AI Check',
        }}
      />

      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
