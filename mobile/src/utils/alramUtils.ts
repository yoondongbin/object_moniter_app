import notifee, { AndroidImportance } from '@notifee/react-native';

// 타입 정의
interface NotificationItem {
  id?: string;
  title?: string;
  body?: string;
  data?: any;
}

// 알림 채널 생성 (Android용)
export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'object-detection',
    name: '객체 감지 알림',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
}

// 객체 감지 알림 전송
export async function sendDetectionNotification(detectionData?: any) {
  try {
    // Android 채널 생성
    await createNotificationChannel();
    
    // 데이터를 문자열로 변환
    const safeData = {
      danger_level: detectionData?.danger_level?.toString() || 'unknown',
      confidence: detectionData?.confidence?.toString() || '0',
      object_class: detectionData?.object_class?.toString() || 'unknown',
      detection_type: detectionData?.detection_type?.toString() || 'unknown',
      timestamp: new Date().toISOString()
    };
    
    const notification = {
      title: '🚨 객체 감지됨!',
      body: detectionData?.danger_level === 'high' 
        ? '⚠️ 위험한 객체가 감지되었습니다!' 
        : detectionData?.danger_level === 'medium'
        ? '⚠️ 주의가 필요한 객체가 감지되었습니다!'
        : '📸 객체가 감지되었습니다.',
      data: safeData,
    };

    await notifee.displayNotification({
      ...notification,
      android: {
        channelId: 'object-detection',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [300, 500],
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
        interruptionLevel: 'active',
      },
    });

    console.log('✅ 로컬 알림 전송 완료:', notification.title);
  } catch (error) {
    console.error('❌ 로컬 알림 전송 실패:', error);
  }
}

// 위험도별 알림 전송
export async function sendDangerLevelNotification(dangerLevel: string, confidence?: number) {
  const notifications = {
    high: {
      title: '🚨 극도로 위험!',
      body: `극도로 위험한 객체가 감지되었습니다! (신뢰도: ${confidence?.toFixed(2) || 'N/A'})`,
      sound: 'alarm',
    },
    medium: {
      title: '⚠️ 위험 감지!',
      body: `위험한 객체가 감지되었습니다! (신뢰도: ${confidence?.toFixed(2) || 'N/A'})`,
      sound: 'default',
    },
    low: {
      title: '👀 의심스러운 객체',
      body: `의심스러운 객체가 감지되었습니다! (신뢰도: ${confidence?.toFixed(2) || 'N/A'})`,
      sound: 'default',
    },
    safe: {
      title: '✅ 안전 상태',
      body: '모든 것이 안전합니다.',
      sound: 'default',
    },
  };

  const notification = notifications[dangerLevel as keyof typeof notifications] || notifications.safe;

  try {
    await createNotificationChannel();
    
    // 안전한 데이터 객체 생성
    const safeData = {
      danger_level: dangerLevel,
      confidence: confidence?.toString() || '0',
      timestamp: new Date().toISOString()
    };
    
    await notifee.displayNotification({
      ...notification,
      data: safeData,
      android: {
        channelId: 'object-detection',
        importance: AndroidImportance.HIGH,
        sound: notification.sound,
        vibrationPattern: dangerLevel === 'high' ? [300, 500, 300, 500] : [300, 500],
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
        interruptionLevel: dangerLevel === 'high' ? 'critical' : 'active',
      },
    });

    console.log(`✅ ${dangerLevel} 레벨 알림 전송 완료`);
  } catch (error) {
    console.error('❌ 위험도 알림 전송 실패:', error);
  }
}

// export async function sendTestNotification() {
//   try {
//     await createNotificationChannel();
    
//     const testData = {
//       type: 'test',
//       timestamp: new Date().toISOString()
//     };
    
//     await notifee.displayNotification({
//       title: '🧪 테스트 알림',
//       body: '알림 기능이 정상적으로 작동합니다!',
//       data: testData,
//       android: {
//         channelId: 'object-detection',
//         importance: AndroidImportance.HIGH,
//         sound: 'default',
//         vibrationPattern: [300, 500],
//         pressAction: {
//           id: 'default',
//         },
//       },
//       ios: {
//         foregroundPresentationOptions: {
//           alert: true,
//           badge: true,
//           sound: true,
//         },
//         interruptionLevel: 'active',
//       },
//     });

//     console.log('✅ 테스트 알림 전송 완료');
//   } catch (error) {
//     console.error('❌ 테스트 알림 전송 실패:', error);
//   }
// }

export async function onDisplayNotification(notification: NotificationItem) {
  await sendDetectionNotification(notification);
}