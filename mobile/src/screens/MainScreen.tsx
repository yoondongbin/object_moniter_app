import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import styles from '../styles/MainScreen.styles';
import { DetectionService } from '../services/api/detectionApi';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import AlertSummaryCard from '../components/AlertSummaryCard';
import { NotificationService } from '../services/api/notificationApi';
import { detectionUtils } from '../utils/detectionUtils';

const MainScreen = ({ navigation }: any) => {
  const [detections, setDetections] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImagePicker = async () => {
    if (isDetecting) {
      Alert.alert('탐지 중', '이미 객체 탐지가 진행 중입니다.');
      return;
    }

    const imageUri = await detectionUtils.handleImagePicker();
    if (imageUri) {
      setSelectedImage(imageUri);
    }
  };

  const handleStartDetection = async () => {
    if (isDetecting) {
      Alert.alert('탐지 중', '이미 객체 탐지가 진행 중입니다.');
      return;
    }

    if (!selectedImage) {
      console.log(detections)
      Alert.alert('이미지 선택', '먼저 이미지를 선택해주세요.');
      return;
    }

    setIsDetecting(true);
    setIsUploading(true);

    await detectionUtils.handleStartDetection(
      selectedImage,
      () => {
        // 성공 시 콜백
        setSelectedImage(null);
        setIsDetecting(false);
        setIsUploading(false);
        // 탐지 목록 새로고침
        const detectionService = DetectionService.getInstance();
        detectionService.getDetections().then((result: any) => setDetections(result ?? []));
      },
      (error: string) => {
        // 오류 시 콜백
        Alert.alert('오류', error);
        setIsDetecting(false);
        setIsUploading(false);
      }
    );
  };

  const handleClearImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      {/* 이미지 선택 카드 */}
      <View style={styles.imageSelectionCard}>
        <Text style={styles.imageSelectionTitle}>객체 탐지</Text>
        <TouchableOpacity
          style={[styles.detectionButton, isDetecting && styles.detectionButtonDisabled]}
          onPress={handleImagePicker}
          disabled={isDetecting}
        >
          <Text style={styles.detectionButtonText}>
            {isDetecting ? '탐지 중...' : '이미지 선택'}
          </Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <View style={styles.imageActionsContainer}>
              <TouchableOpacity
                style={styles.startDetectionButton}
                onPress={handleStartDetection}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.startDetectionButtonText}>탐지 시작</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearImageButton}
                onPress={handleClearImage}
                disabled={isUploading}
              >
                <Text style={styles.clearImageButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* 최근 탐지 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 탐지</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
          </TouchableOpacity>
        </View>
        
        {detections.length > 0 ? (
          <View style={styles.sectionCard}>
            <FlatList
              data={detections}
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
            />
          </View>
        ) : (
          <View style={styles.emptyContainerDashed}>
            <Text style={styles.emptyTitle}>아직 탐지 기록이 없습니다</Text>
            <Text style={styles.emptySubtitle}>위에서 이미지를 선택하여{'\n'}객체 탐지를 시작해보세요</Text>
          </View>
        )}
      </View>

      {/* 최근 알림 섹션 */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 알림</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>더보기</Text>
          </TouchableOpacity>
        </View>

        {notifications.length > 0 ? (
          <View style={styles.sectionCard}>
            <FlatList
              data={notifications}
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
            />
          </View>
        ) : (
          <View style={styles.emptyContainerDashed}>
            <Text style={styles.emptyTitle}>알림이 없습니다</Text>
            <Text style={styles.emptySubtitle}>객체 탐지 시 알림이 표시됩니다</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MainScreen;