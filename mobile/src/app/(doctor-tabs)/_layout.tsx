import React from 'react';
import { Tabs } from 'expo-router';
import { DoctorTabBar } from '../../components/DoctorTabBar';

export default function DoctorTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <DoctorTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />

      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
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
          title: 'Practice',
        }}
      />

      <Tabs.Screen
        name="patient-detail"
        options={{
          href: null,
          title: 'Patient Record',
        }}
      />
    </Tabs>
  );
}
