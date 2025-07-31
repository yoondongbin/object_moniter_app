import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DailyStats } from '../data/dummyStats';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// 가장 오래된 날짜 계산
export function getOldestDate(stats: DailyStats[]): Date {
  const oldest = stats.reduce((prev, curr) =>
    dayjs(curr.date).isBefore(dayjs(prev.date)) ? curr : prev);
  return new Date(oldest.date);
}

// 주차 오프셋에 따라 주간 데이터 필터링
export function getStatsByWeekOffset(
  stats: DailyStats[],
  weekOffset: number
): DailyStats[] {
  const today = dayjs();
  const endOfTargetWeek = today.subtract(weekOffset, 'week').endOf('week');
  const startOfTargetWeek = endOfTargetWeek.subtract(6, 'day');

  return stats.filter((stat) => {
    const statDate = dayjs(stat.date);
    return (
      statDate.isSameOrAfter(startOfTargetWeek, 'day') &&
      statDate.isSameOrBefore(endOfTargetWeek, 'day')
    );
  });
}