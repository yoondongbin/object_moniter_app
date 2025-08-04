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
        source={{ uri: resolveThumbnailUrl(item.thumbnail) }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* 탐지 라벨 */}
      <Text style={styles.label}>{item.label}</Text>

      {/* 정확도 및 위험도 */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>정확도: {item.confidence.toFixed(1)}%</Text>
        <Text
          style={[
            styles.riskText,
            item.riskLevel === '높음'
              ? styles.riskHigh
              : item.riskLevel === '중간'
              ? styles.riskMedium
              : styles.riskLow,
          ]}
        >
          {item.riskLevel}
        </Text>
      </View>

      {/* 탐지 시간 */}
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );
}
