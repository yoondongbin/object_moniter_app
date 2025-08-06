import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import styles from '../styles/AlertListScreen.styles';
import { NotificationService, type NotificationData } from '../services/api/notificationApi';
import AlertSummaryCard from '../components/AlertSummaryCard';

interface AlertListScreenProps {
  navigation?: any;
}

export default function AlertListScreen({ navigation }: AlertListScreenProps) {
  const [notificationList, setNotificationList] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAllNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const notificationService = NotificationService.getInstance();
      const result = await notificationService.getNotifications();
      
      console.log('AlertListScreen - 알림 데이터:', result); // 디버깅용
      
      // MainScreen과 동일한 방식으로 처리
      setNotificationList((result as any) ?? []);
    } catch (error) {
      console.error('알림 로드 실패:', error);
      setNotificationList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllNotifications();
  }, []);

  const handleNotificationPress = (notification: NotificationData) => {
    // 알림을 눌렀을 때 상세 화면으로 이동
    // detection_id가 있는지 안전하게 확인
    const detectionId = (notification as any).detection_id;
    if (navigation && detectionId) {
      navigation.navigate('Detail', { id: detectionId });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체 알림 목록</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>알림을 불러오는 중...</Text>
        </View>
      ) : notificationList.length > 0 ? (
        <FlatList
          data={notificationList}
          keyExtractor={(item) => item.id?.toString() || `alert-${Date.now()}`}
          renderItem={({ item }) => (
            <AlertSummaryCard 
              item={item} 
              onPress={() => handleNotificationPress(item)} 
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>알림이 없습니다</Text>
          <Text style={styles.emptyStateDescription}>
            객체 탐지 시 위험한 상황이 감지되면{'\n'}
            여기에 알림이 표시됩니다
          </Text>
          <Text style={styles.emptyStateHint}>
            메인 화면에서 객체 탐지를 실행해보세요
          </Text>
        </View>
      )}
    </View>
  );
}
