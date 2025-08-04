import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';

export type ObjectData = {
  id?: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  user_id?: number;
  detection_count?: number;
  last_detection?: string;
};

export type ObjectResponse = {
  success: boolean;
  data: ObjectData | ObjectData[];
  message?: string;
};

export class ObjectService {
  private static instance: ObjectService;

  private constructor() {}

  // 싱글톤 패턴
  public static getInstance(): ObjectService {
    if (!ObjectService.instance) {
      ObjectService.instance = new ObjectService();
    }
    return ObjectService.instance;
  }

  // 객체 목록 조회
  async getObjects(): Promise<ObjectResponse> {
    try {
      const response = await apiClient.get<ObjectResponse>(API_ENDPOINTS.OBJECTS.LIST.path);
      return response;
    } catch (error) {
      console.error('❌ 객체 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 객체 조회
  async getObjectById(objectId: number): Promise<ObjectResponse> {
    try {
      const response = await apiClient.get<ObjectResponse>(
        API_ENDPOINTS.OBJECTS.DETAIL(objectId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 객체 ${objectId} 조회 실패:`, error);
      throw error;
    }
  }

  // 객체 생성
  async createObject(objectData: Partial<ObjectData>): Promise<ObjectResponse> {
    try {
      const response = await apiClient.post<ObjectResponse>(
        API_ENDPOINTS.OBJECTS.CREATE.path,
        objectData
      );
      return response;
    } catch (error) {
      console.error('❌ 객체 생성 실패:', error);
      throw error;
    }
  }

  // 객체 업데이트
  async updateObject(objectId: number, objectData: Partial<ObjectData>): Promise<ObjectResponse> {
    try {
      const response = await apiClient.put<ObjectResponse>(
        API_ENDPOINTS.OBJECTS.UPDATE(objectId).path,
        objectData
      );
      return response;
    } catch (error) {
      console.error(`❌ 객체 ${objectId} 업데이트 실패:`, error);
      throw error;
    }
  }

  // 객체 삭제
  async deleteObject(objectId: number): Promise<ObjectResponse> {
    try {
      const response = await apiClient.delete<ObjectResponse>(
        API_ENDPOINTS.OBJECTS.DELETE(objectId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 객체 ${objectId} 삭제 실패:`, error);
      throw error;
    }
  }

  // 객체 상태 전환 (모니터링 시작/중지)
  async switchObject(objectId: number): Promise<ObjectResponse> {
    try {
      const response = await apiClient.patch<ObjectResponse>(
        API_ENDPOINTS.OBJECTS.SWITCH(objectId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 객체 ${objectId} 상태 전환 실패:`, error);
      throw error;
    }
  }

  // 활성 객체만 조회
  async getActiveObjects(): Promise<ObjectResponse> {
    try {
      const response = await apiClient.get<ObjectResponse>(
        `${API_ENDPOINTS.OBJECTS.LIST.path}?status=active`
      );
      return response;
    } catch (error) {
      console.error('❌ 활성 객체 조회 실패:', error);
      throw error;
    }
  }

  // 모니터링 중인 객체만 조회
  async getMonitoringObjects(): Promise<ObjectResponse> {
    try {
      const response = await apiClient.get<ObjectResponse>(
        `${API_ENDPOINTS.OBJECTS.LIST.path}?status=monitoring`
      );
      return response;
    } catch (error) {
      console.error('❌ 모니터링 객체 조회 실패:', error);
      throw error;
    }
  }

  // 객체 검색
  async searchObjects(query: string): Promise<ObjectResponse> {
    try {
      const response = await apiClient.get<ObjectResponse>(
        `${API_ENDPOINTS.OBJECTS.LIST.path}?search=${encodeURIComponent(query)}`
      );
      return response;
    } catch (error) {
      console.error('❌ 객체 검색 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 export
export const objectService = ObjectService.getInstance();