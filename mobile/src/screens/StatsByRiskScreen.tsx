import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import styles from '../styles/StatsByRiskScreen.styles';
import chartConfig from '../config/chartConfig';

const screenWidth = Dimensions.get('window').width;

export default function StatsByRiskScreen() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetections = async () => {
      try {
        setLoading(true);
        setError(null);
        const detectionService = DetectionService.getInstance();
        const result = await detectionService.getDetections();
        
        // API 응답 구조 처리
        const detectionData = result?.data || result || [];
        
        // 배열인지 확인
        if (Array.isArray(detectionData)) {
          setDetections(detectionData);
        } else {
          console.warn('탐지 데이터가 배열이 아닙니다:', detectionData);
          setDetections([]);
        }
      } catch (err) {
        console.error('탐지 데이터 로딩 실패:', err);
        setError('데이터를 불러올 수 없습니다.');
        setDetections([]);
      } finally {
        setLoading(false);
      }
    };

    loadDetections();
  }, []);

  // 위험도 레벨 매핑 (영어 → 한글)
  const riskLevelMapping: Record<string, string> = {
    'high': '높음',
    'medium': '중간',
    'low': '낮음',
    'safe': '안전'
  };

  const riskCounts = detections.reduce(
    (acc, cur) => {
      // danger_level이 존재하는지 확인
      const dangerLevel = cur.danger_level || 'safe';
      const mappedLevel = riskLevelMapping[dangerLevel] || dangerLevel;
      acc[mappedLevel] = (acc[mappedLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const colors: Record<string, string> = {
    '높음': '#FF6B6B',
    '중간': '#FFD166',
    '낮음': '#4ECDC4',
    '안전': '#95E1D3',
  };

  const chartData = Object.entries(riskCounts)
    .filter(([_, count]) => count > 0) // 0개인 항목 제외
    .map(([level, count]) => ({
      name: level,
      count,
      color: colors[level] || '#888',
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  // 로딩 상태 처리
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 빈 데이터 상태 처리
  if (chartData.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.title}>위험 등급별 비율</Text>
        <Text style={styles.emptyText}>표시할 탐지 데이터가 없습니다.</Text>
      </View>
    );
  }

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
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>총 탐지 건수: {detections.length}건</Text>
      </View>
    </View>
  );
}
