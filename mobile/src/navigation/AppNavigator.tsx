import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import MainScreen from '../screens/MainScreen';
import DetectionListScreen from '../screens/DetectionListScreen';
import DetailScreen from '../screens/DetailScreen';
import StatsTabView from '../screens/StatsTabView';
import AlertListScreen from '../screens/AlertListScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ObjectListScreen from '../screens/ObjectListScreen';
import CreateObjectScreen from '../screens/CreateObjectScreen';
import EditObjectScreen from '../screens/EditObjectScreen';
import { authService } from '../services/api/authApi';
import { Colors } from '../styles/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const TopTab = createMaterialTopTabNavigator();

// 로딩 컴포넌트
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
    <ActivityIndicator size="large" color={Colors.primary} />
    <Text style={{ marginTop: 16, fontSize: 16, color: Colors.textSecondary }}>
      로딩 중...
    </Text>
  </View>
);

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

// 객체 관리 스택 (객체 목록 -> 생성/수정)
function ObjectManagementStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ObjectList"
        component={ObjectListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateObject"
        component={CreateObjectScreen}
        options={{ title: '새 객체 생성' }}
      />
      <Stack.Screen
        name="EditObject"
        component={EditObjectScreen}
        options={{ title: '객체 수정' }}
      />
    </Stack.Navigator>
  );
}

// 메인 탭 네비게이터 (인증된 사용자용)
function MainTabNavigator() {
  return (
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
        name="Objects"
        component={ObjectManagementStack}
        options={{ title: '모니터 관리' }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsTabView}
        options={{ title: '통계' }}
      />
    </Tab.Navigator>
  );
}

// 최상위 네비게이터 구성
export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 토큰 상태를 주기적으로 확인하는 useEffect 추가
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isLoading) {
        const token = await authService.getCurrentToken();
        const hasToken = !!token;
        
        if (isAuthenticated && !hasToken) {
          // 토큰이 있었는데 지금 없어진 경우 (로그아웃됨)
          console.log('🔐 토큰이 제거됨 - 로그인 화면으로 이동');
          setIsAuthenticated(false);
        } else if (!isAuthenticated && hasToken) {
          // 토큰이 없었는데 지금 생긴 경우 (로그인됨)
          console.log('🔐 토큰이 추가됨 - 메인 화면으로 이동');
          setIsAuthenticated(true);
        }
        // 토큰 상태가 변경되지 않은 경우는 로그를 출력하지 않음
      }
    }, 3000); // 3초마다 확인 (성능 최적화)

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // access 토큰 존재 여부 확인
      const token = await authService.getCurrentToken();
      const hasToken = !!token;
      
      console.log('🔍 초기 토큰 확인:', hasToken ? '토큰 존재' : '토큰 없음');
      
      if (hasToken) {
        // 토큰이 있으면 유효성 검증 시도
        try {
          // 간단한 API 호출로 토큰 유효성 검증
          // 실제로는 서버에 토큰 검증 요청을 보내야 하지만,
          // 여기서는 토큰 존재 여부만 확인하고, API 호출 시 401 에러가 발생하면
          // apiClient에서 자동으로 토큰을 제거하도록 합니다
          setIsAuthenticated(true);
        } catch (error) {
          console.error('토큰 유효성 검증 실패:', error);
          // 토큰이 유효하지 않으면 제거
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중일 때는 빈 화면을 보여줍니다
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Access 토큰이 존재하면 메인 페이지로 이동
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
          />
        ) : (
          // Access 토큰이 없으면 로그인 페이지로 이동
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
