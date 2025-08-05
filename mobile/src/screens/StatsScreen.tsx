import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import styles from '../styles/StatsScreen.styles';
import DateRangeSelector from '../components/DateRangeSelector';
import Chart from '../components/Chart';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { getStatsByRange, getWeekData } from '../utils/statsUtils';  // utils 함수 import
import { CHART_CONFIG, CHART_COLORS, getResponsiveChartSize } from '../constants/chartConstants';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

// 반응형 레이아웃 상수 (차트 상수 사용)
const CHART_SIZE = getResponsiveChartSize();
const CHART_WIDTH = CHART_SIZE.width;
const CHART_HEIGHT = CHART_SIZE.height;

export default function StatsScreen() {
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 날짜 범위 상태 추가
  const [startDate, setStartDate] = useState<Date>(() => {
    // 기본값: 1주일 전부터 오늘까지
    return dayjs().subtract(7, 'day').toDate();
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    return dayjs().toDate();
  });

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

  // 날짜 범위 변경 시 차트 데이터 업데이트
  useEffect(() => {
    if (detections.length > 0) {
      console.log(`날짜 범위 업데이트: ${dayjs(startDate).format('YYYY-MM-DD')} ~ ${dayjs(endDate).format('YYYY-MM-DD')}`);
    }
  }, [startDate, endDate, detections]);

  // 선택된 날짜 범위에 따른 데이터 생성
  const statsData = getStatsByRange(detections, startDate, endDate);

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

    // 최소 3일치 데이터가 필요 (LineChart 안정성을 위해)
    if (validStats.length < 3) {
      // 부족한 데이터 포인트를 0으로 채움
      const paddedStats = [...validStats];
      while (paddedStats.length < 3) {
        const lastDate = paddedStats[paddedStats.length - 1]?.date || dayjs().format('YYYY-MM-DD');
        paddedStats.push({
          date: dayjs(lastDate).add(1, 'day').format('YYYY-MM-DD'),
          count: 0,
          danger_levels: { safe: 0, low: 0, medium: 0, high: 0 }
        });
      }
      validStats.push(...paddedStats.slice(validStats.length));
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

  return (
    <View style={styles.container}>
      {/* 고정 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>통계</Text>
        <Text style={styles.subtitle}>시간대별 • 위험 등급별 • 유형별</Text>
      </View>

      {/* 스크롤 가능한 콘텐츠 */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
      >
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
              <Text style={styles.chartTitle}>탐지 현황 추이</Text>
              <Text style={styles.chartSubtitle}>
                {dayjs(startDate).format('YYYY.MM.DD')} ~ {dayjs(endDate).format('YYYY.MM.DD')}
              </Text>
              {chartData ? (
                <Chart 
                  data={chartData} 
                  type="line" 
                  showLegend={detections.length > 0}
                  legendLabels={['전체 탐지', '위험 탐지']}
                  chartWidth={CHART_WIDTH}
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
            {detections.length === 0 && (
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
          </>
        )}
      </ScrollView>
    </View>
  );
}