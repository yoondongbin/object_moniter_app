import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DetectionService, type DetectionItem } from '../services/api/detectionApi';
import { ObjectService, type ObjectData } from '../services/api/objectApi';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import styles from '../styles/StatsByLabelScreen.styles';
import chartConfig from '../config/chartConfig';
import DateRangeSelector from '../components/DateRangeSelector';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

const screenWidth = Dimensions.get('window').width;

export default function StatsByLabelScreen() {
  const [detections, setDetections] = useState<DetectionItem[]>([]);
  const [objects, setObjects] = useState<ObjectData[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [objectsLoading, setObjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 전체 기간으로 설정 (디폴트)
  const [startDate, setStartDate] = useState<Date>(() => {
    return dayjs().subtract(7, 'day').toDate(); // 7일 전부터
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    return dayjs().toDate(); // 오늘까지
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
    } finally {
      setObjectsLoading(false);
    }
  }, [selectedObject]);

  // 탐지 데이터 로드
  const loadDetections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const detectionService = DetectionService.getInstance();
      
      if (selectedObject) {
        // 특정 객체의 탐지 데이터 가져오기
        const response = await detectionService.getDetectionsByObject(selectedObject.id!);
        const detectionData = response?.data || response || [];
        
        if (Array.isArray(detectionData)) {
          setDetections(detectionData);
        } else {
          console.warn('탐지 데이터가 배열이 아닙니다:', detectionData);
          setDetections([]);
        }
      } else {
        // 전체 탐지 데이터 가져오기
        const result = await detectionService.getDetections();
        const detectionData = result?.data || result || [];
        
        if (Array.isArray(detectionData)) {
          setDetections(detectionData);
        } else {
          console.warn('탐지 데이터가 배열이 아닙니다:', detectionData);
          setDetections([]);
        }
      }
    } catch (err) {
      console.error('탐지 데이터 로딩 실패:', err);
      setError('데이터를 불러올 수 없습니다.');
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

  // 날짜 범위에 따른 데이터 필터링
  const filteredByDate = filteredDetections.filter(detection => {
    const detectionDate = dayjs(detection.created_at);
    return detectionDate.isAfter(dayjs(startDate).subtract(1, 'day')) && 
           detectionDate.isBefore(dayjs(endDate).add(1, 'day'));
  });

  // 탐지 유형 매핑 (영어 → 한글)
  const detectionTypeMapping: Record<string, string> = {
    'person': '사람',
    'dangerous_object': '위험 객체',
    'suspicious_object': '의심 객체',
    'unknown': '미분류'
  };

  const labelCounts = filteredByDate.reduce((acc, cur) => {
    // detection_type이 존재하는지 확인
    const detectionType = cur.detection_type || 'unknown';
    const mappedType = detectionTypeMapping[detectionType] || detectionType;
    acc[mappedType] = (acc[mappedType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const colors = ['#4ECDC4', '#FF6B6B', '#FFD166', '#6A4C93', '#1A535C', '#95E1D3', '#FFA07A'];

  const chartData = Object.entries(labelCounts)
    .filter(([_, count]) => count > 0) // 0개인 항목 제외
    .map(([label, count], index) => ({
      name: label,
      population: count,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 14,
    }));

  // 객체 선택 핸들러
  const handleObjectSelect = (object: ObjectData) => {
    setSelectedObject(object);
  };

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

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
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
          />
        </View>

        {/* 차트 영역 */}
        <View style={styles.chartContainer}>
          <Text style={styles.title}>
            {selectedObject ? `${selectedObject.name} 탐지 유형별 비율` : '전체 탐지 유형별 비율'}
          </Text>
          <Text style={styles.subtitle}>
            {dayjs(startDate).format('YYYY.MM.DD')} ~ {dayjs(endDate).format('YYYY.MM.DD')}
          </Text>
          
          {chartData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>표시할 탐지 데이터가 없습니다.</Text>
            </View>
          ) : (
            <>
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
              <View style={styles.statsContainer}>
                <Text style={styles.statsText}>총 탐지 건수: {filteredByDate.length}건</Text>
                <Text style={styles.statsText}>유형 수: {chartData.length}개</Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
