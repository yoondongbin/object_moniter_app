import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import MainScreen from '../screens/MainScreen';
import DetectionListScreen from '../screens/DetectionListScreen';
import DetailScreen from '../screens/DetailScreen';
import StatsScreen from '../screens/StatsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 탐지 관련 스택 구성 : 리스트 -> 상세
function DetectionStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='DetectionList'
                component={DetectionListScreen}
                options={{ title: '탐지 리스트'}}
            />
            <Stack.Screen
                name='Detail'
                component={DetailScreen}
                options={{ title: '상세 보기'}}
            />
        </Stack.Navigator>
    )
}

// 최상위 탭 네비게이터
export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Tab.Navigator>
                <Tab.Screen
                    name='Main'
                    component={MainScreen}
                    options={{ title: '메인' }}
                />
                <Tab.Screen
                    name='Detection'
                    component={DetectionStack}
                    options={{ title: '탐지'}}
                />
                <Tab.Screen
                    name='Stats'
                    component={StatsScreen}
                    options={{ title: '통계'}}
                />
            </Tab.Navigator>
        </NavigationContainer>
    )
}