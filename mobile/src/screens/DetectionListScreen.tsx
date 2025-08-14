import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import styles from '../styles/DetectionListScreen.styles';
import DetectionSummaryCard from '../components/DetectionSummaryCard';
import { detectionService, type DetectionItem } from '../services/api';

interface DetectionListScreenProps {
  navigation: any; // TODO: 정확한 navigation 타입 지정 필요
}

const DetectionListScreen = ({ navigation }: DetectionListScreenProps) => {
  const [detectionList, setDetectionList] = useState<DetectionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAllDetections = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await detectionService.getDetections();
      
      // API 서비스는 배열을 직접 반환하므로 그대로 사용
      setDetectionList(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('탐지 결과 로드 실패:', error);
      setDetectionList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllDetections();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>탐지 리스트</Text>
      <Text style={styles.subtitle}>전체 탐지 결과</Text>
      
      {!isLoading && detectionList.length > 0 ? (
        <FlatList
          data={detectionList}
          keyExtractor={(item) => item.id?.toString() || `detection-${Date.now()}`}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item, index }) => {
            const handleCardPress = () => navigation.navigate('Detail', { id: item.id });
            const isLastInRow = (index % 2) === 1;
            
            return (
              <DetectionSummaryCard
                item={item}
                onPress={handleCardPress}
                isGridLayout={true}
                isLastInRow={isLastInRow}
              />
            );
          }}
          contentContainerStyle={styles.gridListContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : !isLoading ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>탐지 결과가 없습니다</Text>
          <Text style={styles.emptyStateDescription}>
            메인 화면에서 객체 탐지를 실행하여{'\n'}
            결과를 확인해보세요
          </Text>
          <Text style={styles.emptyStateHint}>
            탐지 완료 후 여기서 모든 결과를 볼 수 있습니다
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default DetectionListScreen;