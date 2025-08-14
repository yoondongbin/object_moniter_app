import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens, enableFreeze } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import notifee, { EventType } from '@notifee/react-native';

// 네비/스크린 최적화 + freeze는 우선 비활성화(버전 충돌 우회)
enableScreens(true);
enableFreeze(false);

export default function App() {
  useEffect(() => {
    async function requestPermission() {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
        console.log('✅ 알림 권한 허용됨');
      } else {
        console.log('❌ 알림 권한 거부됨');
      }
    }

    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log('알림이 터치되었습니다:', detail.notification);
          break;
        case EventType.DISMISSED:
          console.log('알림이 해제되었습니다:', detail.notification);
          break;
      }
    });

    requestPermission();
    return () => unsubscribe();
  }, []);

  // 제스처 루트로 감싸주기 (named import 필수)
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}