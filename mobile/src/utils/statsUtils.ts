import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { DailyStats } from '../data/dummyStats';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

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