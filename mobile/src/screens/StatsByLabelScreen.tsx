import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { detectionService, notificationService, type DetectionItem, type NotificationData } from '../services/api';
import styles from '../styles/DetailScreen.styles';

const DetailScreen = ({ route }: any) => {
  const { id, objectId } = route.params;
  const [detectionData, setDetectionData] = useState<DetectionItem | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const loadDetailData = async () => {
      try {
        setIsLoading(true);
        
        const [detectionResult, notificationResult] = await Promise.all([
          detectionService.getDetection(objectId || 1, id),
          notificationService.getNotifications()
        ]);
        
        setDetectionData(detectionResult);
        
        const allNotifications = Array.isArray(notificationResult) ? notificationResult : [];
        const relatedNotifications = allNotifications.filter((n: any) => n.detection_id === id);
        
        setNotifications(relatedNotifications);
      } catch (error) {
        console.error('상세 정보 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetailData();
  }, [id, objectId]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text>상세 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!detectionData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>탐지 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>탐지 상세 정보</Text>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>탐지 결과</Text>
          <Text style={styles.label}>ID: {detectionData.id}</Text>
          <Text style={styles.value}>시간: {new Date(detectionData.created_at).toLocaleString()}</Text>
          <Text style={styles.value}>위험도: {detectionData.danger_level}</Text>
          <Text style={styles.value}>신뢰도: {(detectionData.confidence * 100).toFixed(1)}%</Text>
          <Text style={styles.value}>탐지 유형: {detectionData.detection_type}</Text>
          <Text style={styles.value}>객체 클래스: {detectionData.object_class}</Text>
          
          {/* Bounding Box 정보 표시 */}
          {(detectionData.bbox_x !== undefined && detectionData.bbox_y !== undefined) && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>위치 정보:</Text>
              <Text style={styles.value}>X: {detectionData.bbox_x}, Y: {detectionData.bbox_y}</Text>
              {detectionData.bbox_width && detectionData.bbox_height && (
                <Text style={styles.value}>크기: {detectionData.bbox_width} × {detectionData.bbox_height}</Text>
              )}
            </View>
          )}
        </View>

        {notifications.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>관련 알림</Text>
            {notifications.map((notification, index) => (
              <View key={index} style={{ marginBottom: 12 }}>
                <Text style={styles.value}>{notification.message}</Text>
                <Text style={styles.label}>
                  {new Date(notification.created_at).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DetailScreen;