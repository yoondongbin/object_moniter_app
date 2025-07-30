export type DailyStats = {
    date: string;   // YYYY-MM-DD 형식
    count: number;  // 탐지 건수
  };
  
  export const dummyStats: DailyStats[] = [
    { date: '2025-07-22', count: 3 },
    { date: '2025-07-23', count: 5 },
    { date: '2025-07-24', count: 2 },
    { date: '2025-07-25', count: 6 },
    { date: '2025-07-26', count: 4 },
    { date: '2025-07-27', count: 7 },
    { date: '2025-07-28', count: 1 },
    { date: '2025-07-29', count: 5 },
    { date: '2025-07-30', count: 4 },
    { date: '2025-07-31', count: 6 },
    { date: '2025-08-01', count: 3 },
    { date: '2025-08-02', count: 8 },
    { date: '2025-08-03', count: 5 },
    { date: '2025-08-04', count: 6 },
    { date: '2025-08-05', count: 7 },
  ];