import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import styles from '../styles/MainScreen.styles';
import { DetectionService } from '../services/api/detectionApi';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import AlertSummaryCard from '../components/AlertSummaryCard';
import { NotificationService } from '../services/api/notificationApi';

const MainScreen = ({ navigation }: any) => {
  const [detections, setDetections] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    const detectionService = DetectionService.getInstance();
    const notificationService = NotificationService.getInstance();
    detectionService.getDetections().then((result: any) => {
      console.log('Detection API response:', result);
      const detectionData = result?.data || result || [];
      setDetections(detectionData);
    }).catch((error) => {
      console.error('Failed to fetch detections:', error);
      setDetections([]);
    });
    notificationService.getNotifications().then((result: any) => setNotifications(result ?? []));
  }, []);

  const handleStartDetection = async () => {
    if (isDetecting) {
      Alert.alert('탐지 중', '이미 객체 탐지가 진행 중입니다.');
      return;
    }

    setIsDetecting(true);

    try {
      const detectionService = DetectionService.getInstance();
      // 백엔드에서 무작위 이미지로 탐지 수행
      await detectionService.createDetection();
      
      // 탐지 목록 새로고침
      detectionService.getDetections().then((result: any) => setDetections(result ?? []));
      
      Alert.alert('탐지 완료', '객체 탐지가 완료되었습니다.');
    } catch (error) {
      console.error('Detection error:', error);
      Alert.alert('오류', '객체 탐지 중 오류가 발생했습니다.');
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
      // iOS 바운스 효과 완전 비활성화
      bounces={false}
      alwaysBounceVertical={false}
      alwaysBounceHorizontal={false}
      // Android 오버스크롤 효과 비활성화
      overScrollMode="never"
      // iOS 콘텐츠 인셋 조정 비활성화
      contentInsetAdjustmentBehavior={Platform.OS === 'ios' ? 'never' : undefined}
      automaticallyAdjustContentInsets={false}
      // 스크롤 성능 최적화
      scrollEventThrottle={16}
      removeClippedSubviews={true}
      // 추가 스크롤 제어
      directionalLockEnabled={true}
      pagingEnabled={false}
    >
      {/* 객체 탐지 카드 */}
      <View style={styles.imageSelectionCard}>
        <TouchableOpacity
          style={[styles.detectionButton, isDetecting && styles.detectionButtonDisabled]}
          onPress={handleStartDetection}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.detectionButtonText}>객체 탐지</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 최근 탐지 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 탐지</Text>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => navigation.navigate('Detection', { screen: 'DetectionList' })}
          >
            <Text style={styles.moreButtonText}>더보기</Text>
          </TouchableOpacity>
        </View>
        
        {detections.length > 0 ? (
          <View style={styles.sectionCard}>
            <FlatList
              data={detections.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DetectionSummaryCard
                  item={item}
                  onPress={() =>
                    navigation.navigate('Detection', {
                      screen: 'Detail',
                      params: { id: item.id },
                    })
                  }
                />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              scrollEnabled={true}
              nestedScrollEnabled={false}
              bounces={false}
              overScrollMode="never"
            />
          </View>
        ) : (
          <View style={styles.emptyContainerDashed}>
            <Text style={styles.emptyTitle}>아직 탐지 기록이 없습니다</Text>
            <Text style={styles.emptySubtitle}>위의 버튼을 눌러서{'\n'}객체 탐지를 시작해보세요</Text>
          </View>
        )}
      </View>

      {/* 최근 알림 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 알림</Text>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => navigation.navigate('Detection', { screen: 'AlertList' })}
          >
            <Text style={styles.moreButtonText}>더보기</Text>
          </TouchableOpacity>
        </View>

        {notifications.length > 0 ? (
          <View style={styles.sectionCard}>
            <FlatList
              data={notifications.slice(0, 5)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AlertSummaryCard
                  item={item}
                  onPress={() =>
                    navigation.navigate('Detection', {
                      screen: 'Detail',
                      params: { id: item.id },
                    })
                  }
                />
              )}
              scrollEnabled={false}
              nestedScrollEnabled={false}
              bounces={false}
              overScrollMode="never"
            />
          </View>
        ) : (
          <View style={styles.emptyContainerDashed}>
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptySubtitle}>객체 탐지 시 알림이 표시됩니다</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default MainScreen;