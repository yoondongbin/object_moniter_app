import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { getDetectionById } from '../services/api/detectionApi';
import type { DetectionItem } from '../services/api/detectionApi';
import { getAlertById } from '../services/api/alertApi';
import type { AlertItem } from '../services/api/alertApi';
import styles from '../styles/DetailScreen.styles';
import { resolveThumbnailUrl } from '../utils/imageUtils';

const DetailScreen = () => {
  const route = useRoute();
  const { id } = route.params as { id: string };

  const [detection, setDetection] = useState<DetectionItem | null>(null);
  const [alert, setAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    getDetectionById(id).then((result) => setDetection(result ?? null));
    getAlertById(id).then((result) => setAlert(result ?? null));
  }, [id]);

  if (!detection) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>해당 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>탐지 정보</Text>
      <Image
        source={{ uri: resolveThumbnailUrl(detection.thumbnail) }}
        style={styles.thumbnail}
      />
      <View style={styles.card}>
        <Text style={styles.label}>유형: <Text style={styles.value}>{detection.label}</Text></Text>
        <Text style={styles.label}>시간: <Text style={styles.value}>{detection.time}</Text></Text>
        <Text style={styles.label}>정확도: <Text style={styles.value}>{detection.confidence.toFixed(1)}%</Text></Text>
        <Text style={styles.label}>위험도: <Text style={styles.value}>{detection.riskLevel}</Text></Text>
        <Text style={styles.label}>위치: <Text style={styles.value}>{detection.location}</Text></Text>
        <Text style={styles.label}>객체 수: <Text style={styles.value}>{detection.objectCount}개</Text></Text>
      </View>

      {alert && (
        <>
          <Text style={styles.sectionTitle}>알림 정보</Text>
          <View style={styles.card}>
            <Text style={styles.label}>유형: <Text style={styles.value}>{alert.type}</Text></Text>
            <Text style={styles.label}>시간: <Text style={styles.value}>{alert.time}</Text></Text>
            <Text style={styles.label}>심각도: <Text style={styles.value}>{alert.severity}</Text></Text>
          </View>
        </>
      )}
    </View>
  );
};

export default DetailScreen;
