export type DetectionSummary = {
    id: string;
    label: string;
    time: string;
    thumbnail: string;
  };
  
  export const dummySummaryDetections: DetectionSummary[] = [
    {
      id: '1',
      label: '사람 감지',
      time: '2025-07-29 14:23',
      thumbnail: '썸네일1',
    },
    {
      id: '2',
      label: '폭력 행동',
      time: '2025-07-29 14:18',
      thumbnail: '썸네일2',
    },
    {
      id: '3',
      label: '침입 감지',
      time: '2025-07-29 13:50',
      thumbnail: '썸네일3',
    },
  ];
  