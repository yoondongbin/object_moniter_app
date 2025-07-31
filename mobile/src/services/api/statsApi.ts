import type { DailyStats } from '../../data/dummyStats';
import { dummyStats } from '../../data/dummyStats';

export const getStatsByWeek = async (weekOffset: number): Promise<DailyStats[]> => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() - weekOffset * 7);

    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    return dummyStats.filter((item) => {
        const date = new Date(item.date);
        return date >= start && date <= end;
    });
};

export type { DailyStats };