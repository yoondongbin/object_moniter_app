import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { detectionService, notificationService, type DetectionResult, type Notification } from '../services/api';
import styles from '../styles/DetailScreen.styles';

const DetailScreen = ({ route }: any) => {
  const { id, objectId } = route.params;
  const [detectionData, setDetectionData] = useState<DetectionResult | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  // 위험도 색상 매핑
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD166';
      case 'low': return '#4ECDC4';
      case 'safe': return '#95E1D3';
      default: return '#95E1D3';
    }
  };

  // 위험도 한글 변환
  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'high': return '높음';
      case 'medium': return '중간';
      case 'low': return '낮음';
      case 'safe': return '안전';
      default: return '안전';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>상세 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!detectionData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>탐지 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>탐지 상세 정보</Text>
      
      {/* 이미지 표시 */}
      {detectionData.image_path && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: detectionData.image_path }} 
            style={styles.detectionImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      {/* 기본 정보 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>기본 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>탐지 ID:</Text>
          <Text style={styles.value}>{detectionData.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>탐지 시간:</Text>
          <Text style={styles.value}>
            {new Date(detectionData.created_at).toLocaleString('ko-KR')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>위험도:</Text>
          <View style={[styles.riskBadge, { backgroundColor: getRiskColor(detectionData.danger_level) }]}>
            <Text style={styles.riskText}>{getRiskLevelText(detectionData.danger_level)}</Text>
          </View>
        </View>
      </View>

      {/* 탐지 상세 정보 카드 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>탐지 결과</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>탐지 유형:</Text>
          <Text style={styles.value}>{detectionData.detection_type || '미분류'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>객체 클래스:</Text>
          <Text style={styles.value}>{detectionData.object_class || '미분류'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>신뢰도:</Text>
          <Text style={styles.value}>{(detectionData.confidence * 100).toFixed(1)}%</Text>
        </View>
      </View>

      {/* 위치 정보 카드 */}
      {(detectionData.bbox_x !== undefined && detectionData.bbox_y !== undefined) && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>위치 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>X 좌표:</Text>
            <Text style={styles.value}>{detectionData.bbox_x}px</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Y 좌표:</Text>
            <Text style={styles.value}>{detectionData.bbox_y}px</Text>
          </View>
          {detectionData.bbox_width && detectionData.bbox_height && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>너비:</Text>
                <Text style={styles.value}>{detectionData.bbox_width}px</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>높이:</Text>
                <Text style={styles.value}>{detectionData.bbox_height}px</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* 관련 알림 카드 */}
      {notifications.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>관련 알림 ({notifications.length}개)</Text>
          {notifications.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              <Text style={styles.notificationTime}>
                {new Date(notification.created_at).toLocaleString('ko-KR')}
              </Text>
              {!notification.is_read && <View style={styles.unreadDot} />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default DetailScreen;