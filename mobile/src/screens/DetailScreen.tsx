import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { NotificationService, type NotificationData } from '../services/api/notificationApi';
import styles from '../styles/DetailScreen.styles';
import { formatDateTime } from '../utils/dateUtils';

const DetailScreen = () => {
  const route = useRoute();
  const { id } = route.params as { id: number };

  const [detection, setDetection] = useState<DetectionItem | null>(null);
  const [notification, setNotification] = useState<NotificationData | null>(null);
  
  useEffect(() => {
    const detectionService = DetectionService.getInstance();
    const notificationService = NotificationService.getInstance();

    detectionService.getDetectionById(id).then((result: any) => setDetection(result ?? null));
    notificationService.getNotificationByDetectionId(id).then((result: any) => setNotification(result ?? null));
  }, [id]);

  if (!detection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>해당 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>탐지 정보</Text>
      <Image
        source={{ uri: (detection.image_path || '') }}
        style={styles.thumbnail}
      />
      <View style={styles.card}>
        <Text style={styles.label}>유형: <Text style={styles.value}>{detection.detection_type}</Text></Text>
        <Text style={styles.label}>시간: <Text style={styles.value}>{formatDateTime(detection.created_at)}</Text></Text>
        <Text style={styles.label}>정확도: <Text style={styles.value}>{(Number(detection.confidence)*100).toFixed(1)}%</Text></Text>
        <Text style={styles.label}>위험도: <Text style={styles.value}>{detection.danger_level}</Text></Text>
      </View>

      {notification && (
        <>
          <Text style={styles.sectionTitle}>알림 정보</Text>
          <View style={styles.card}>
            <Text style={styles.label}>유형: <Text style={styles.value}>{notification.title}</Text></Text>
            <Text style={styles.label}>메세지: <Text style={styles.value}>{notification.message}</Text></Text>
            <Text style={styles.label}>시간: <Text style={styles.value}>{formatDateTime(notification.created_at)}</Text></Text>
            <Text style={styles.label}>심각도: <Text style={styles.value}>{notification.notification_type}</Text></Text>
          </View>
        </>
      )}
    </View>
    </ScrollView>
  );
};

export default DetailScreen;
