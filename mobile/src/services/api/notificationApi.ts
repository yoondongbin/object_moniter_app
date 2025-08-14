import axiosInstance from "../../utils/axiosInstance";
import { API_ENDPOINTS } from "../../config/apiConfig";
import type { Notification, ApiResponse } from '../../types/api';

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 알림 목록 조회
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await axiosInstance.get<Notification[]>(
        API_ENDPOINTS.NOTIFICATIONS.LIST
      );
      // 백엔드가 직접 배열을 반환하므로 response.data로 접근
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('❌ 알림 목록 조회 실패:', error);
      throw new Error('알림을 불러올 수 없습니다.')
    }
  }

  // 알림 상세 조회
  async getNotification(id: number): Promise<Notification> {
    try {
      const response = await axiosInstance.get<Notification>(
        API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)
      );
      // 백엔드가 직접 객체를 반환하므로 response.data로 접근
      if (!response.data) {
        throw new Error('알림을 찾을 수 없습니다.');
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ 알림 조회 실패:', error);
      throw new Error('알림 정보를 불러올 수 없습니다.');
    }
  }

  // 알림 읽음 처리
  async markAsRead(id: number): Promise<void> {
    try {
      await axiosInstance.put(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      console.log('✅ 알림 읽음 처리 완료');
    } catch (error: any) {
      console.error('❌ 알림 읽음 처리 실패:', error);
      throw new Error('알림 상태 변경에 실패했습니다.');
    }
  }

  // 알림 삭제
  async deleteNotification(id: number): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      console.log('✅ 알림 삭제 완료');
    } catch (error: any) {
      console.error('❌ 알림 삭제 실패:', error);
      throw new Error('알림 삭제에 실패했습니다.');
    }
  }
}

export const notificationService = NotificationService.getInstance();
export { NotificationService };