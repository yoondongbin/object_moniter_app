import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import styles from '../styles/StatsByLabelScreen.styles';
import chartConfig from '../config/chartConfig';

const screenWidth = Dimensions.get('window').width;

export default function StatsByLabelScreen() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);

  useEffect(() => {
    const detectionService = DetectionService.getInstance();
    detectionService.getDetections().then((result: any) => setDetections(result ?? []));
  }, []);

  const labelCounts = detections.reduce((acc, cur) => {
    acc[cur.detection_type] = (acc[cur.detection_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = ['#4ECDC4', '#FF6B6B', '#FFD166', '#6A4C93', '#1A535C'];

  const chartData = Object.entries(labelCounts).map(([label, count], index) => ({
    name: label,
    population: count,
    color: colors[index % colors.length],
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>탐지 유형별 비율</Text>
      <PieChart
        data={chartData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="16"
        absolute
      />
    </View>
  );
}
