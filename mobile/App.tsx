import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { authService } from './src/services/api/authApi';
import AppNavigator from './src/navigation/AppNavigator';
import notifee, { EventType } from '@notifee/react-native';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function requestPermission() {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= 1) {
        console.log('✅ 알림 권한 허용됨');
      } else {
        console.log('❌ 알림 권한 거부됨');
      }
    }

    // 알림 이벤트 리스너 설정
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log('알림이 터치되었습니다:', detail.notification);
          // 알림 터치 시 특정 화면으로 이동하는 로직 추가 가능
          break;
        case EventType.DISMISSED:
          console.log('알림이 해제되었습니다:', detail.notification);
          break;
      }
    });

    requestPermission(); // 앱 시작 시 1회 요청
    autoLogin();

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribe();
    };
  }, []);

  const autoLogin = async () => {
    try {
      const response = await authService.login({
        username: 'testuser',  // email 대신 username 사용
        password: 'test123'
      });
      console.log(response);
      // response.data.token 대신 response.data.access_token 사용
      if (response && response.access_token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('자동 로그인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>초기화 중...</Text>
      </View>
    );
  }

  return isLoggedIn ? <AppNavigator /> : <Text>로그인 실패</Text>;
}