import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationData = {
  id?: number;
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
  created_at?: string;
  user_id?: number;
};

export type NotificationResponse = {
  success: boolean;
  data: NotificationData | NotificationData[];
  message?: string;
};

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  // 싱글톤 패턴
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // 알림 목록 조회
  async getNotifications(): Promise<NotificationResponse> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('알림 API 호출 전 토큰 확인:', token ? token.substring(0, 20) + '...' : '없음');
      
      if (!token) {
        throw new Error('토큰이 없습니다');
      }
      const response = await apiClient.get<NotificationResponse>(API_ENDPOINTS.NOTIFICATIONS.LIST.path);
      return response;
    } catch (error) {
      console.error('❌ 알림 목록 조회 실패:', error);
      throw error;
    }
  }

  // 특정 알림 조회
  async getNotificationById(notificationId: number): Promise<NotificationResponse> {
    try {
      const response = await apiClient.get<NotificationResponse>(
        API_ENDPOINTS.NOTIFICATIONS.DETAIL(notificationId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 알림 ${notificationId} 조회 실패:`, error);
      throw error;
    }
  }

  // 알림 읽음 처리
  async checkNotification(notificationId: number): Promise<NotificationResponse> {
    try {
      const response = await apiClient.put<NotificationResponse>(
        API_ENDPOINTS.NOTIFICATIONS.CHECK(notificationId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 알림 ${notificationId} 읽음 처리 실패:`, error);
      throw error;
    }
  }

  // 알림 삭제
  async deleteNotification(notificationId: number): Promise<NotificationResponse> {
    try {
      const response = await apiClient.delete<NotificationResponse>(
        API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId).path
      );
      return response;
    } catch (error) {
      console.error(`❌ 알림 ${notificationId} 삭제 실패:`, error);
      throw error;
    }
  }

  // 내부 알림 전송
  async sendInternalNotification(notificationData: Partial<NotificationData>): Promise<NotificationResponse> {
    try {
      const response = await apiClient.post<NotificationResponse>(
        API_ENDPOINTS.NOTIFICATIONS.SEND_INTERNAL.path,
        notificationData
      );
      return response;
    } catch (error) {
      console.error('❌ 내부 알림 전송 실패:', error);
      throw error;
    }
  }

  // // 실시간 알림 구독 (Socket.IO)
  // subscribeToNotifications(callback: (notification: NotificationData) => void): void {
  //   // Socket.IO 구독 로직
  //   // 이 부분은 실제 Socket.IO 구현에 따라 달라집니다
  //   console.log('🔔 실시간 알림 구독 시작');
  // }

  // 실시간 알림 구독 해제
  unsubscribeFromNotifications(): void {
    // Socket.IO 구독 해제 로직
    console.log('🔕 실시간 알림 구독 해제');
  }
}

// 싱글톤 인스턴스 export
export const notificationService = NotificationService.getInstance();