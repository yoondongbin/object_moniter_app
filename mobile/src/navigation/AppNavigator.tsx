import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import MainScreen from '../screens/MainScreen';
import DetectionListScreen from '../screens/DetectionListScreen';
import DetailScreen from '../screens/DetailScreen';
import StatsTabView from '../screens/StatsTabView';
import AlertListScreen from '../screens/AlertListScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

// 탐지 리스트 스택 (탐지 리스트 -> 상세)
function DetectionListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DetectionList"
        component={DetectionListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: '상세 보기' }}
      />
    </Stack.Navigator>
  );
}

// 알림 리스트 스택 (알림 리스트 -> 상세)
function AlertListStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AlertList"
        component={AlertListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: '상세 보기' }}
      />
    </Stack.Navigator>
  );
}

// 탐지 관련 상단 탭 구성
function DetectionTopTabs() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <TopTab.Screen
        name="DetectionTab"
        component={DetectionListStack}
        options={{ title: '탐지 리스트' }}
      />
      <TopTab.Screen
        name="AlertTab"
        component={AlertListStack}
        options={{ title: '알림 전체' }}
      />
    </TopTab.Navigator>
  );
}

// 최상위 탭 네비게이터 구성
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Main"
          component={MainScreen}
          options={{ title: '메인' }}
        />
        <Tab.Screen
          name="Detection"
          component={DetectionTopTabs}
          options={{ title: '탐지' }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsTabView}
          options={{ title: '통계' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
