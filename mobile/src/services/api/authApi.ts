import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 인증 관련 타입 정의
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      name: string;
      created_at: string;
      updated_at: string;
    };
  };
  message?: string;
};

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  // 싱글톤 패턴
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 로그인 API
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN.path,
        credentials
      );
      
      // 로그인 성공 시에만 토큰 저장
      if (response.data.token) {
        await this.saveToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      throw error;
    }
  }

  // 회원가입 API
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER.path,
        userData
      );
      
      // 회원가입 성공 시에도 토큰 저장 (자동 로그인)
      if (response.data.token) {
        await this.saveToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      throw error;
    }
  }

  // 토큰 갱신 API
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH.path,
        {}
      );
      
      // 토큰 갱신 성공 시 새 토큰 저장
      if (response.data.token) {
        await this.saveToken(response.data.token);
      }
      
      return response;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      throw error;
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      // 토큰 제거
      await this.removeToken();
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  }

  // 인증 상태 확인
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const hasToken = !!token;
      this.token = token;
      console.log('🔍 인증 상태 확인:', hasToken ? '인증됨' : '인증되지 않음');
      return hasToken;
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      return false;
    }
  }

  // 현재 토큰 가져오기
  async getCurrentToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('accessToken');
    }
    return this.token;
  }

  // 토큰 저장 헬퍼 함수
  private async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('accessToken', token);
      this.token = token;
      console.log('✅ 토큰이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('❌ 토큰 저장 실패:', error);
      throw error;
    }
  }

  // 토큰 제거 헬퍼 함수
  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('accessToken');
      this.token = null;
      console.log('✅ 토큰이 성공적으로 제거되었습니다.');
    } catch (error) {
      console.error('❌ 토큰 제거 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 export
export const authService = AuthService.getInstance();