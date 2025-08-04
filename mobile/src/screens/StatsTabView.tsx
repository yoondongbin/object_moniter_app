import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import StatsByTimeScreen from '../screens/StatsByTimeScreen';
import StatsByRiskScreen from '../screens/StatsByRiskScreen';
import StatsByLabelScreen from '../screens/StatsByLabelScreen';

const Tab = createMaterialTopTabNavigator();

export default function StatsTabView() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#888',
        lazy: true, // 성능 최적화: 탭 이동 시에만 렌더링
      }}
    >
      <Tab.Screen name="시간대별" component={StatsByTimeScreen} />
      <Tab.Screen name="위험 등급별" component={StatsByRiskScreen} />
      <Tab.Screen name="유형별" component={StatsByLabelScreen} />
    </Tab.Navigator>
  );
}
