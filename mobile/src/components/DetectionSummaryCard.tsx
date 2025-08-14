import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DetectionItem, objectService } from '../services/api';
import styles from '../styles/DetectionSummaryCard.styles';
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
  
  console.log(item);
  
  useEffect(() => {
    const fetchObject = async () => {
      try {
        const response = await objectService.getObject(item.object_id);
        setObjectName(response?.name || 'Unknown Object');
      } catch (error) {
        console.error('객체 정보 조회 실패:', error);
        setObjectName('Unknown Object');
      }
    };
    
    fetchObject();
  }, [item.object_id]);

  const cardStyle = isGridLayout 
    ? [styles.card, styles.gridCard, isLastInRow && styles.lastInRow]
    : styles.card;

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress}>
      <Image
        source={{ 
            uri: (item.image_path) 
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
            item.risk_level === 'high'
              ? styles.riskHigh
              : item.risk_level === 'medium'
              ? styles.riskMedium
              : styles.riskLow,
          ]}
        >
          {item.risk_level}
        </Text>
      </View>

      {/* 탐지 시간 */}
      <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
    </TouchableOpacity>
  );
}