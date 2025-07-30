import { dummySummaryAlerts } from '../../data/summaryAlerts';

export type AlertItem = {
  id: string;
  type: string;
  time: string;
};

// 전체 알림 불러오기 (더미)
export const getAlerts = async (): Promise<AlertItem[]> => {
    return Promise.resolve(dummySummaryAlerts);
        // 나중 axios 사용
    // return axios.get('/api/alerts').then(res => res.data);
  };


// id 기반 단건 조회(더미)
export const getAlertById = async (id: string): Promise<AlertItem | undefined> => {
    const found = dummySummaryAlerts.find((item) => item.id === id);
    return Promise.resolve(found);

    // 나중 axios 사용
    // return axios.get(`/api/alerts/${id}`).then(res => res.data);
}