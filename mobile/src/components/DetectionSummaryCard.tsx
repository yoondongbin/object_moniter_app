import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DetectionItem } from '../services/api/detectionApi';
import styles from '../styles/DetectionSummaryCard.styles';
import { ObjectService } from '../services/api/objectApi';
import { formatDateTime } from '../utils/dateUtils';

type Props = {
  item: DetectionItem;
  onPress: () => void;
  isGridLayout?: boolean;
  isLastInRow?: boolean;
};

export default function DetectionSummaryCard({ 
  item, 
  onPress, 
  isGridLayout = false,
  isLastInRow = false 
}: Props) {
  const [objectName, setObjectName] = useState<string>('Loading...');
  const objectService = ObjectService.getInstance();
  console.log(item);
  useEffect(() => {
    const fetchObject = async () => {
      try {
        const response = await objectService.getObjectById(item.object_id);
        
        let objectData;
        if (response.data) {
          objectData = Array.isArray(response.data) ? response.data[0] : response.data;
        } else {
          objectData = Array.isArray(response) ? response[0] : response;
        }
        
        setObjectName(objectData?.name || 'Unknown Object');
      } catch (error) {
        setObjectName('Unknown Object');
      }
    };
    
    fetchObject();
  }, [item.object_id, objectService]);

  const cardStyle = isGridLayout 
    ? [styles.card, styles.gridCard, isLastInRow && styles.lastInRow]
    : styles.card;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      {/* 썸네일 이미지 */}
      <Image
        source={{ 
            uri: item.image_path 
        }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* 탐지 라벨 */}
      <Text style={styles.label}>{objectName}</Text>

      {/* 정확도 및 위험도 */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>정확도: {(Number(item.confidence)*100).toFixed(1)}%</Text>
        <Text
          style={[
            styles.riskText,
            item.danger_level === 'high'
              ? styles.riskHigh
              : item.danger_level === 'medium'
              ? styles.riskMedium
              : styles.riskLow,
          ]}
        >
          {item.danger_level}
        </Text>
      </View>

      {/* 탐지 시간 */}
      <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
    </TouchableOpacity>
  );
}
