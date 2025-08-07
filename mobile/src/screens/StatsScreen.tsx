import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles/StatsScreen.styles';
import DateRangeSelector from '../components/DateRangeSelector';
import Chart from '../components/Chart';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { ObjectService, type ObjectData } from '../services/api/objectApi';
import { getStatsByRange } from '../utils/statsUtils';
import { CHART_COLORS, getResponsiveChartSize } from '../constants/chartConstants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

// 반응형 레이아웃 상수 (차트 상수 사용)
const CHART_SIZE = getResponsiveChartSize();
const CHART_WIDTH = CHART_SIZE.width;
const CHART_HEIGHT = CHART_SIZE.height;

export default function StatsScreen() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [objectsLoading, setObjectsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState<Date>(() => {
    return dayjs().subtract(7, 'day').toDate();
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    return dayjs().toDate();
  });

  // 객체 목록 로드
  const loadObjects = useCallback(async () => {
    try {
      setObjectsLoading(true);
      const objectService = ObjectService.getInstance();
      const response = await objectService.getObjects();
      
      if (response.success && Array.isArray(response.data)) {
        setObjects(response.data);
        if (response.data.length > 0 && !selectedObject) {
          setSelectedObject(response.data[0]);
        }
      }
    } catch (error) {
      console.error('객체 목록 로드 실패:', error);
      Alert.alert('오류', '객체 목록을 불러오는데 실패했습니다.');
    } finally {
      setObjectsLoading(false);
    }
  }, [selectedObject]);

  // 탐지 데이터 로드
  const loadDetections = useCallback(async () => {
    try {
      setLoading(true);
      const detectionService = DetectionService.getInstance();
      
      if (selectedObject) {
        // 특정 객체의 탐지 데이터 가져오기
        const response = await detectionService.getDetectionsByObject(selectedObject.id!);
        if (response.success && Array.isArray(response.data)) {
          setDetections(response.data);
        } else if (Array.isArray(response)) {
          setDetections(response);
        } else {
          setDetections([]);
        }
      } else {
        // 전체 탐지 데이터 가져오기
        const response = await detectionService.getDetections();
        if (response.success && Array.isArray(response.data)) {
          setDetections(response.data);
        } else if (Array.isArray(response)) {
          setDetections(response);
        } else {
          setDetections([]);
        }
      }
    } catch (error) {
      console.error('탐지 데이터 로드 실패:', error);
      setDetections([]);
    } finally {
      setLoading(false);
    }
  }, [selectedObject]);

  // 화면이 포커스될 때마다 데이터를 새로고침
  useFocusEffect(
    useCallback(() => {
      loadObjects();
    }, [loadObjects])
  );

  // 선택된 객체가 변경될 때 탐지 데이터 다시 로드
  useEffect(() => {
    if (selectedObject) {
      loadDetections();
    }
  }, [selectedObject, loadDetections]);

  // 선택된 객체가 변경될 때 탐지 데이터 필터링
  const filteredDetections = selectedObject 
    ? detections.filter(detection => detection.object_id === selectedObject.id)
    : detections;

  // 날짜 범위 변경 시 차트 데이터 업데이트
  useEffect(() => {
    if (filteredDetections.length > 0) {
      console.log(`날짜 범위 업데이트: ${dayjs(startDate).format('YYYY-MM-DD')} ~ ${dayjs(endDate).format('YYYY-MM-DD')}`);
    }
  }, [startDate, endDate, filteredDetections]);

  // 선택된 날짜 범위에 따른 데이터 생성
  const statsData = getStatsByRange(filteredDetections, startDate, endDate);

  // 안전한 차트 데이터 생성
  const createSafeChartData = () => {
    // 유효한 데이터만 필터링
    const validStats = statsData.filter(d => 
      d && 
      d.date && 
      typeof d.count === 'number' && 
      d.danger_levels &&
      typeof d.danger_levels.high === 'number' &&
      typeof d.danger_levels.medium === 'number'
    );

    // 데이터가 없거나 모든 값이 0인 경우 기본 차트 반환
    if (validStats.length === 0) {
      return null; // 차트를 렌더링하지 않음
    }

    return {
      labels: validStats.map((d) => dayjs(d.date).format('M/D')),
      datasets: [
        {
          data: validStats.map((d) => Math.max(0, d.count || 0)),
          color: (opacity = 1) => CHART_COLORS.PRIMARY.replace('1)', `${opacity})`), // 보라색 선
          strokeWidth: 3,
        },
        {
          data: validStats.map((d) => Math.max(0, (d.danger_levels?.high || 0) + (d.danger_levels?.medium || 0))),
          color: (opacity = 1) => CHART_COLORS.DANGER.replace('1)', `${opacity})`), // 위험 탐지 (빨간색)
          strokeWidth: 2,
        }
      ],
    };
  };

  const chartData = createSafeChartData();

  // 객체 선택 핸들러
  const handleObjectSelect = (object: ObjectData) => {
    setSelectedObject(object);
  };

  return (
    <View style={styles.container}>
      {/* 고정 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>통계</Text>
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* 객체 선택 영역 */}
        <View style={styles.objectSelectorContainer}>
          <Text style={styles.sectionTitle}>객체 선택</Text>
          {objectsLoading ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : objects.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.objectListContainer}
            >
              {objects.map((object) => (
                <TouchableOpacity
                  key={object.id}
                  style={[
                    styles.objectItem,
                    selectedObject?.id === object.id && styles.selectedObjectItem
                  ]}
                  onPress={() => handleObjectSelect(object)}
                >
                  <Text style={[
                    styles.objectItemText,
                    selectedObject?.id === object.id && styles.selectedObjectItemText
                  ]}>
                    {object.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.noObjectsText}>등록된 객체가 없습니다</Text>
          )}
        </View>

        {/* 날짜 선택 영역 */}
        <View style={styles.dateRangeContainer}>
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            chartWidth={CHART_WIDTH}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 차트 영역 */}
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {selectedObject ? `${selectedObject.name} 탐지 현황` : '전체 탐지 현황'}
              </Text>
              <Text style={styles.chartSubtitle}>
                {dayjs(startDate).format('YYYY.MM.DD')} ~ {dayjs(endDate).format('YYYY.MM.DD')}
              </Text>
              {chartData ? (
                <Chart 
                  data={chartData} 
                  type="line" 
                  showLegend={filteredDetections.length > 0}
                  legendLabels={['전체 탐지', '위험 탐지']}
                  chartWidth={CHART_WIDTH - 40} // 패딩 고려
                  chartHeight={CHART_HEIGHT}
                />
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Text style={styles.emptyChartText}>표시할 데이터가 없습니다</Text>
                  <Text style={styles.emptyChartSubtext}>
                    다른 날짜 범위를 선택하거나 탐지를 실행해보세요
                  </Text>
                </View>
              )}
            </View>
            
            {/* 통계 요약 카드 */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>총 탐지 수</Text>
                <Text style={styles.summaryValue}>
                  {statsData.length > 0 ? statsData.reduce((sum, d) => sum + (d.count || 0), 0) : 0}건
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>위험 탐지</Text>
                <Text style={[styles.summaryValue, styles.dangerValue]}>
                  {statsData.length > 0 ? statsData.reduce((sum, d) => sum + (d.danger_levels?.high || 0) + (d.danger_levels?.medium || 0), 0) : 0}건
                </Text>
              </View>
            </View>

            {/* 데이터가 없을 때 안내 메시지 */}
            {filteredDetections.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>통계 데이터가 없습니다</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedObject ? `${selectedObject.name}에 대한` : ''} 객체 탐지를 실행하면 여기서{'\n'}
                  다양한 통계를 확인할 수 있습니다
                </Text>
                <Text style={styles.emptyDescription}>
                  • 시간대별 탐지 현황{'\n'}
                  • 위험 등급별 분포{'\n'}
                  • 객체 유형별 통계
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}