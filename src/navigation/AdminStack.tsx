import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminDashboard } from '@/screens/admin/AdminDashboard';
import { AdminVetting } from '@/screens/admin/AdminVetting';
import { AdminPipeline } from '@/screens/admin/AdminPipeline';
import { View, Text } from 'react-native';
import { LayoutDashboard, Users, Zap } from 'lucide-react-native';

import { LogoutButton } from '@/components/LogoutButton';

const Tab = createBottomTabNavigator();

// Placeholders for other tabs
const Placeholder = ({ name }: { name: string }) => (
  <View className="flex-1 items-center justify-center bg-background">
    <Text className="text-xl font-bold">{name}</Text>
  </View>
);

export const AdminStack = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerRight: () => <LogoutButton />,
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={AdminDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Vetting" 
        component={AdminVetting} 
        options={{
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          tabBarLabel: 'Vetting',
        }}
      />
      <Tab.Screen 
        name="Pipeline" 
        component={AdminPipeline} 
        options={{
          tabBarIcon: ({ color, size }) => <Zap size={size} color={color} />,
          tabBarLabel: 'Pipeline',
        }}
      />
    </Tab.Navigator>
  );
};
