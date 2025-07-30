import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/DetailScreen.styles';
import { RouteProp, useRoute } from '@react-navigation/native';
import { getDetectionById, DetectionItem } from '../services/api/detectionApi';
import { getAlertById, AlertItem } from '../services/api/alertApi';

// 네비게이션 파라미터 타입 정의
type RootStackParamList = {
  Detail: { id: string };
};
type DetailRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { id } = route.params;

  const [detection, setDetection] = useState<DetectionItem | null>(null);
  const [alert, setAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    getDetectionById(id).then((res) => {
      if (res) setDetection(res);
    });
    getAlertById(id).then((res) => {
      if (res) setAlert(res);
    });
  }, [id]);

  if (!detection && !alert) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>탐지 정보를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>탐지</Text>
      {detection && (
        <View style={styles.box}>
          <Text style={styles.label}>{detection.label}</Text>
          <Text style={styles.time}>{detection.time}</Text>
        </View>
      )}

      <Text style={styles.title}>상세 보기</Text>
      {alert && (
        <View style={styles.box}>
          <Text style={styles.label}>{alert.type}</Text>
          <Text style={styles.time}>{alert.time}</Text>
        </View>
      )}
    </View>
  );
}
