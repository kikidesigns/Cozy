import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@components/HapticTab';
import { IconSymbol } from '@components/ui/IconSymbol';
import TabBarBackground from '@components/ui/TabBarBackground';
import { Colors } from '@constants/Colors';
import { useColorScheme } from '@hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tint,
        },
        headerTintColor: '#fff',
        tabBarStyle: {
          ...Platform.select({
            ios: {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              borderTopColor: Colors[colorScheme ?? 'light'].tint,
              borderTopWidth: 1,
            },
            default: {
              backgroundColor: Colors[colorScheme ?? 'light'].background,
              borderTopColor: Colors[colorScheme ?? 'light'].tint,
              borderTopWidth: 1,
            },
          }),
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="hand.wave.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}