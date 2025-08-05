import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import styles from '../styles/StatsScreen.styles';
import WeekSelector from '../components/WeekSelector';
import Chart from '../components/Chart';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { getWeekData } from '../utils/statsUtils';  // utils 함수 import
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

export default function StatsScreen() {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDetections = async () => {
      try {
        setLoading(true);
        const detectionService = DetectionService.getInstance();
        const response = await detectionService.getDetections();
        
        if (response.success && Array.isArray(response.data)) {
          setDetections(response.data);
        }
      } catch (error) {
        console.error('탐지 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
  }, []);

  const weekData = getWeekData(detections, selectedWeekOffset);

  // 차트 데이터 생성
  const chartData = {
    labels: weekData.map((d) => dayjs(d.date).format('M/D(dd)')),
    datasets: [{ data: weekData.map((d) => d.count) }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>통계</Text>
      <Text style={styles.subtitle}>시간대별 • 위험 등급별 • 유형별</Text>

      {detections.length > 0 ? (
        <>
          <View style={styles.weekContainer}>
            <WeekSelector
              selectedOffset={selectedWeekOffset}
              onChange={setSelectedWeekOffset}
            />
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>데이터 로딩 중...</Text>
            </View>
          ) : (
            <Chart data={chartData} />
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>통계 데이터가 없습니다</Text>
          <Text style={styles.emptySubtitle}>
            객체 탐지를 실행하면 여기서{'\n'}
            다양한 통계를 확인할 수 있습니다
          </Text>
          <Text style={styles.emptyDescription}>
            • 시간대별 탐지 현황{'\n'}
            • 위험 등급별 분포{'\n'}
            • 객체 유형별 통계
          </Text>
        </View>
      )}
    </View>
  );
}