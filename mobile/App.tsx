import React, { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import notifee, { EventType } from '@notifee/react-native';

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

    return () => {
      unsubscribe();
    };
  }, []);

  return <AppNavigator />;
}