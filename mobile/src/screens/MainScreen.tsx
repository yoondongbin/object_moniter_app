import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import styles from '../styles/MainScreen.styles';
import { 
  detectionService, 
  notificationService, 
  objectService, // 추가
  authService 
} from '../services/api';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import AlertSummaryCard from '../components/AlertSummaryCard';
import { sendDetectionNotification, sendDangerLevelNotification } from '../utils/alramUtils';

const MainScreen = ({ navigation }: any) => {
  const [detections, setDetections] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);

  // 객체 목록 로드
  const loadObjects = async () => {
    try {
      const objectsResult = await objectService.getObjects();
      setObjects(Array.isArray(objectsResult) ? objectsResult : []);
    } catch (error) {
      console.error('Failed to load objects:', error);
    }
  };

  const refreshNotifications = async () => {
    try {
      const notificationResult = await notificationService.getNotifications();
      setNotifications(Array.isArray(notificationResult) ? notificationResult : []);
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  const refreshDetections = async () => {
    try {
      const detectionResult = await detectionService.getDetections();
      setDetections(Array.isArray(detectionResult) ? detectionResult : []);
    } catch (error) {
      console.error('Failed to refresh detections:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          loadObjects(),
          refreshDetections(),
          refreshNotifications()
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleStartDetection = async () => {
    if (isDetecting) {
      Alert.alert('탐지 중', '이미 객체 탐지가 진행 중입니다.');
      return;
    }

    // 객체가 없으면 경고
    if (objects.length === 0) {
      Alert.alert('객체 없음', '탐지할 객체가 없습니다. 먼저 객체를 등록해주세요.', [
        { text: '확인' },
        { text: '객체 등록', onPress: () => navigation.navigate('CreateObject') }
      ]);
      return;
    }

    setIsDetecting(true);

    try {
      // 첫 번째 active 객체에 대해 탐지 실행
      const activeObject = objects.find(obj => obj.status === 'active') || objects[0];
      
      console.log(`🔍 객체 탐지 시작: ${activeObject.name} (ID: ${activeObject.id})`);
      
      // 실제 탐지 API 호출
      const detectionResult = await detectionService.executeDetection(activeObject.id);
      
      console.log('✅ 탐지 성공:', detectionResult);
      
      // 탐지 완료 후 데이터 새로고침
      await Promise.all([
        refreshDetections(),
        refreshNotifications()
      ]);
      
      Alert.alert('탐지 완료', `"${activeObject.name}" 객체 탐지가 완료되었습니다.`);
      
    } catch (error: any) {
      console.error('❌ 탐지 실패:', error);
      Alert.alert('탐지 실패', error.message || '객체 탐지 중 오류가 발생했습니다.');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말로 로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        onPress: async () => {
          try {
            await authService.logout();
            
            // 토큰이 제대로 제거되었는지 확인
            const remainingToken = await authService.getCurrentToken();
            if (!remainingToken) {
              console.log('✅ 로그아웃 완료 - AppNavigator에서 자동으로 화면 전환');
              // AppNavigator에서 토큰 상태 변화를 감지하여 자동으로 로그인 화면으로 이동
            } else {
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
          }
        },
      },
    ]);
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
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>객체 탐지 앱</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutButton}>로그아웃</Text>
        </TouchableOpacity>
      </View>

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
            onPress={() => navigation.navigate('Detection', { screen: 'DetectionTab', params: { screen: 'DetectionList' } })}
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
                      screen: 'DetectionTab',
                      params: { screen: 'Detail', params: { id: item.id } },
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
            onPress={() => navigation.navigate('Detection', { screen: 'AlertTab', params: { screen: 'AlertList' } })}
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
                      screen: 'AlertTab',
                      params: { screen: 'Detail', params: { id: item.id } },
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