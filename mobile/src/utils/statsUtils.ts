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