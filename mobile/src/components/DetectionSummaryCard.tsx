import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { DetectionItem } from '../services/api/detectionApi';
import styles from '../styles/DetectionSummaryCard.styles';
import { resolveThumbnailUrl } from '../utils/imageUtils';

type Props = {
  item: DetectionItem;
  onPress: () => void;
};

export default function DetectionSummaryCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* 썸네일 이미지 */}
      <Image
        source={{ uri: resolveThumbnailUrl(item.image_path || '') }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* 탐지 라벨 */}
      <Text style={styles.label}>{item.detection_type}</Text>

      {/* 정확도 및 위험도 */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>정확도: {item.confidence.toFixed(1)}%</Text>
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
