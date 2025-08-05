import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DetectionItem } from '../services/api/detectionApi';
import styles from '../styles/DetectionSummaryCard.styles';
import { ObjectService } from '../services/api/objectApi';

type Props = {
  item: DetectionItem;
  onPress: () => void;
};

export default function DetectionSummaryCard({ item, onPress }: Props) {
  const [objectName, setObjectName] = useState<string>('Loading...');
  const objectService = ObjectService.getInstance();

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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* 썸네일 이미지 */}
      {console.log(item.image_path)}
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
      <Text style={styles.time}>{item.created_at}</Text>
    </TouchableOpacity>
  );
}
