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
      <Text style={styles.title}>주간 탐지 통계</Text>

      <WeekSelector
        selectedOffset={selectedWeekOffset}
        onChange={setSelectedWeekOffset}
      />

      {loading ? (
        <Text>데이터 로딩 중...</Text>
      ) : (
        <Chart data={chartData} />
      )}
    </View>
  );
}