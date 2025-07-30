import { dummySummaryDetections } from '../../data/summaryDetections';

export type DetectionItem = {
    id: string;
    label: string;
    time: string;
    thumbnail: string;
}

// 전체 탐지 목록 불러오기 (더미)
export const getDetections = async (): Promise<DetectionItem[]> => {
    return Promise.resolve(dummySummaryDetections);
    // 나중
    // return axios.get('/api/detections').then(res => res.data);
}

// id 기반 단건 조회 (더미)
export const getDetectionById = async (id: string): Promise<DetectionItem | undefined> => {
    const found = dummySummaryDetections.find((item) => item.id === id);
    return Promise.resolve(found);
    // 나중
    // return axios.get(`/api/detections/${id}`).then(res => res.data);
}