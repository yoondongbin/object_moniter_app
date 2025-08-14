import axiosInstance from "../../utils/axiosInstance";
import { API_ENDPOINTS } from "../../config/apiConfig";
import type {
  ObjectItem,
  CreateObjectRequest,
  UpdateObjectRequest,
  ApiResponse
} from '../../types/api';

class ObjectService {
  private static instance: ObjectService;

  static getInstance(): ObjectService {
    if (!ObjectService.instance) {
      ObjectService.instance = new ObjectService();
    }
    return ObjectService.instance;
  }

  // 객체 목록 조회 - wrapped 응답
  async getObjects(): Promise<ObjectItem[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<ObjectItem[]>>(
        API_ENDPOINTS.OBJECTS.LIST
      );
      return response.data.data || [];
    } catch (error: any) {
      console.error('객체 목록 조회 실패:', error);
      throw new Error('객체 목록을 불러올 수 없습니다.');
    }
  }

  // 객체 상세 조회 - 직접 객체 반환
  async getObject(id: number): Promise<ObjectItem> {
    try {
      const response = await axiosInstance.get<ObjectItem>(
        API_ENDPOINTS.OBJECTS.DETAIL(id)
      );
      if (!response.data) {
        throw new Error('객체를 찾을 수 없습니다.');
      }
      return response.data;
    } catch (error: any) {
      console.error('객체 조회 실패:', error);
      throw new Error('객체 정보를 불러올 수 없습니다.');
    }
  }

  // 객체 생성 - 직접 객체 반환
  async createObject(data: CreateObjectRequest): Promise<ObjectItem> {
    try {
      const response = await axiosInstance.post<ObjectItem>(
        API_ENDPOINTS.OBJECTS.CREATE,
        data
      );
      console.log('객체 생성 성공:', response.data?.name);
      return response.data;
    } catch (error: any) {
      console.error('객체 생성 실패:', error);
      throw new Error(error.response?.data?.error || '객체 생성에 실패했습니다.');
    }
  }

  // 객체 수정 - 직접 객체 반환
  async updateObject(id: number, data: UpdateObjectRequest): Promise<ObjectItem> {
    try {
      const response = await axiosInstance.put<ObjectItem>(
        API_ENDPOINTS.OBJECTS.UPDATE(id),
        data
      );
      console.log('객체 수정 성공:', response.data?.name);
      return response.data;
    } catch (error: any) {
      console.error('객체 수정 실패:', error);
      throw new Error(error.response?.data?.error || '객체 수정에 실패했습니다.');
    }
  }

  // 객체 삭제 - 메시지 응답
  async deleteObject(id: number): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.OBJECTS.DELETE(id));
      console.log('✅ 객체 삭제 성공');
    } catch (error: any) {
      console.error('❌ 객체 삭제 실패:', error);
      throw new Error(error.response?.data?.error || '객체 삭제에 실패했습니다.');
    }
  }

  // 객체 탐지 실행 - 백엔드 응답 구조에 따라 조정
  async detectObject(id: number, frameData?: string): Promise<any> {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.OBJECTS.DETECT(id),
        frameData ? { frame_data: frameData } : {}
      );
      console.log('탐지 실행 성공');
      return response.data;
    } catch (error: any) {
      console.error('탐지 실행 실패:', error);
      throw new Error(error.response?.data?.error || '탐지 실행에 실패했습니다.');
    }
  }
}

export const objectService = ObjectService.getInstance();
export { ObjectService };