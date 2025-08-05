import dayjs from 'dayjs';
import { DetectionItem } from '../services/api/detectionApi';

export interface DailyStats {
  date: string;
  count: number;
  danger_levels: {
    safe: number;
    low: number;
    medium: number;
    high: number;
  };
}

export const groupDetectionsByDate = (detections: DetectionItem[]): DailyStats[] => {
  // 날짜별로 그룹화
  const groupedByDate = detections.reduce((acc, detection) => {
    const date = dayjs(detection.created_at).format('YYYY-MM-DD');
    
    if (!acc[date]) {
      acc[date] = {
        date,
        count: 0,
        danger_levels: { safe: 0, low: 0, medium: 0, high: 0 }
      };
    }
    
    acc[date].count += 1;
    acc[date].danger_levels[detection.danger_level] += 1;
    
    return acc;
  }, {} as Record<string, DailyStats>);

  // 객체를 배열로 변환하고 날짜순 정렬
  return Object.values(groupedByDate).sort((a, b) => 
    dayjs(a.date).diff(dayjs(b.date))
  );
};

export const getWeekData = (detections: DetectionItem[], weekOffset: number = 0): DailyStats[] => {
  const startOfWeek = dayjs().add(weekOffset, 'week').startOf('week');
  const endOfWeek = dayjs().add(weekOffset, 'week').endOf('week');
  
  // 해당 주의 탐지 데이터만 필터링
  const weekDetections = detections.filter(detection => {
    const detectionDate = dayjs(detection.created_at);
    return detectionDate.isAfter(startOfWeek) && detectionDate.isBefore(endOfWeek);
  });
  
  return groupDetectionsByDate(weekDetections);
};

// 날짜 범위 기반 통계 데이터 조회 (실무용 대시보드)
export const getStatsByRange = (
  detections: DetectionItem[], 
  startDate: Date, 
  endDate: Date
): DailyStats[] => {
  const start = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).endOf('day');
  
  // 선택된 날짜 범위의 탐지 데이터만 필터링
  const rangeDetections = detections.filter(detection => {
    const detectionDate = dayjs(detection.created_at);
    return detectionDate.isAfter(start) && detectionDate.isBefore(end);
  });
  
  // 날짜별 그룹화 및 집계
  const dailyStats = groupDetectionsByDate(rangeDetections);
  
  // 빈 날짜들을 0으로 채워서 연속된 데이터 만들기
  const result: DailyStats[] = [];
  let currentDate = start;
  
  // end 날짜까지 반복 (diff를 사용한 날짜 비교)
  while (currentDate.diff(end, 'day') <= 0) {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const existingData = dailyStats.find(stat => stat.date === dateStr);
    
    if (existingData) {
      result.push(existingData);
    } else {
      // 데이터가 없는 날짜는 0으로 채움
      result.push({
        date: dateStr,
        count: 0,
        danger_levels: { safe: 0, low: 0, medium: 0, high: 0 }
      });
    }
    
    currentDate = currentDate.add(1, 'day');
  }
  
  return result;
};

// 위험도별 집계 함수 (대시보드용)
export const getDangerLevelSummary = (stats: DailyStats[]) => {
  return stats.reduce(
    (acc, stat) => {
      acc.safe += stat.danger_levels.safe;
      acc.low += stat.danger_levels.low;
      acc.medium += stat.danger_levels.medium;
      acc.high += stat.danger_levels.high;
      acc.total += stat.count;
      return acc;
    },
    { safe: 0, low: 0, medium: 0, high: 0, total: 0 }
  );
};