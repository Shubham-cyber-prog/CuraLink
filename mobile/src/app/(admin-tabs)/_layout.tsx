import React from 'react';
import { Tabs } from 'expo-router';
import { AdminTabBar } from '../../components/AdminTabBar';

export default function AdminTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      <Tabs.Screen
        name="doctors"
        options={{
          title: 'Verify Docs',
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Admin',
        }}
      />
    </Tabs>
  );
}
