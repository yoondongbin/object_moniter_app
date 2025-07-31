export type DailyStats = {
  date: string; // 형식: '2025-07-31'
  count: number;
};

export const dummyStats: DailyStats[] = [
  { date: '2025-07-31', count: 5 },
  { date: '2025-07-30', count: 8 },
  { date: '2025-07-29', count: 4 },
  { date: '2025-07-28', count: 6 },
  { date: '2025-07-27', count: 3 },
  { date: '2025-07-26', count: 7 },
  { date: '2025-07-25', count: 2 },
  { date: '2025-07-24', count: 4 },
  { date: '2025-07-23', count: 9 },
];
