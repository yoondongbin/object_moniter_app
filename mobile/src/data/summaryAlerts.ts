export type AlertSummary = {
    id: string;
    type: string;
    time: string;
  };
  
  export const dummySummaryAlerts: AlertSummary[] = [
    {
      id: 'a1',
      type: '폭력 행동',
      time: '2025-07-29 14:22',
    },
    {
      id: 'a2',
      type: '침입 감지',
      time: '2025-07-29 13:55',
    },
    {
      id: 'a3',
      type: '불법 주정차',
      time: '2025-07-29 13:45',
    },
  ];