import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { getDetections } from '../services/api/detectionApi';
import { DetectionItem } from '../services/api/detectionApi';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import styles from '../styles/StatsByRiskScreen.styles';
import chartConfig from '../config/chartConfig';

const screenWidth = Dimensions.get('window').width;

export default function StatsByRiskScreen() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);

  useEffect(() => {
    getDetections().then(setDetections);
  }, []);

  const riskCounts = detections.reduce(
    (acc, cur) => {
      acc[cur.riskLevel] = (acc[cur.riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const colors: Record<string, string> = {
    높음: '#FF6B6B',
    중간: '#FFD166',
    낮음: '#4ECDC4',
  };

  const chartData = Object.entries(riskCounts).map(([level, count], index) => ({
    name: level,
    count,
    color: colors[level] || '#888',
    legendFontColor: '#333',
    legendFontSize: 14,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>위험 등급별 비율</Text>
      <PieChart
        data={chartData.map(d => ({
          name: d.name,
          population: d.count,
          color: d.color,
          legendFontColor: d.legendFontColor,
          legendFontSize: d.legendFontSize,
        }))}
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
