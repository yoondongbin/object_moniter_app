import { AlertItem } from '../services/api/alertApi';

export const dummySummaryAlerts: AlertItem[] = [
  {
    id: 'a1',
    type: '무기 소지 침입',
    time: '2025-08-01 12:12',
    detectionId: 'd1',
    severity: '높음',
  },
  {
    id: 'a2',
    type: '폭력 행동',
    time: '2025-08-01 12:24',
    detectionId: 'd2',
    severity: '높음',
  },
  {
    id: 'a3',
    type: '사람 감지',
    time: '2025-08-01 12:36',
    detectionId: 'd3',
    severity: '중간',
  },
  {
    id: 'a4',
    type: '사람 감지',
    time: '2025-08-01 13:01',
    detectionId: 'd4',
    severity: '낮음',
  },
  {
    id: 'a5',
    type: '폭력 행동',
    time: '2025-08-01 13:20',
    detectionId: 'd5',
    severity: '높음',
  },
];