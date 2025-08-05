import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/DetectionListScreen.styles';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';

const DetectionListScreen = ({ navigation }: any) => {
  const [detections, setDetections] = useState<DetectionItem[]>([]);

  useEffect(() => {
    const loadDetections = async () => {
      try {

        const detectionService = DetectionService.getInstance();
        const response = await detectionService.getDetections();
        if (response.success && Array.isArray(response.data)) {
          setDetections(response.data);
        }
      } catch (error) {
        console.error('탐지 결과 로드 실패:', error);
      }
    };
    
    loadDetections();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>탐지 리스트</Text>
      <Text style={styles.subtitle}>전체 탐지 결과</Text>
      
      {detections.length > 0 ? (
        <FlatList
          data={detections}
          keyExtractor={(item) => item.id?.toString() || ''}      
          renderItem={({ item }) => (
            <DetectionSummaryCard
              item={item}
              onPress={() => navigation.navigate('Detail', { id: item.id })}
            />
          )}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>탐지 결과가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            메인 화면에서 이미지를 선택하여{'\n'}
            객체 탐지를 실행해보세요
          </Text>
          <Text style={styles.emptyHint}>
            탐지 완료 후 여기서 결과를 확인할 수 있습니다
          </Text>
        </View>
      )}
    </View>
  );
};

export default DetectionListScreen;