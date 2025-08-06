/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  switch (type) {
    case EventType.PRESS:
      console.log('백그라운드에서 알림이 터치되었습니다:', detail.notification);
      break;
    case EventType.DISMISSED:
      console.log('백그라운드에서 알림이 해제되었습니다:', detail.notification);
      break;
  }
});

AppRegistry.registerComponent(appName, () => App);
