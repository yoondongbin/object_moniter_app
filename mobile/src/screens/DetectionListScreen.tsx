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
      <Text style={styles.title}>전체 탐지 결과</Text>
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
    </View>
  );
};

export default DetectionListScreen;