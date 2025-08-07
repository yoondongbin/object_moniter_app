import apiClient from './apiClient';
import { API_ENDPOINTS } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 인증 관련 타입 정의
export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  email: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    username: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
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

      console.log('로그인 응답:', response);

      // 로그인 성공 시에만 토큰 저장
      if (response.access_token) {
        console.log('토큰 저장 중:', response.access_token.substring(0, 20) + '...');
        await this.saveToken(response.access_token);
      } else {
        console.error('access_token이 없습니다:', response);
      }
      if (response.refresh_token) {
        console.log('refresh_token 저장 중:', response.refresh_token.substring(0, 20) + '...');
        await AsyncStorage.setItem('refreshToken', response.refresh_token);
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
      if (response.access_token) {
        await this.saveToken(response.access_token);
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
      const refreshToken = await AsyncStorage.getItem('refreshToken');
    
      if (!refreshToken) {
        console.log('❌ Refresh token이 없습니다.');
        throw new Error('Refresh token not found');
      }
      
      console.log('🔄 토큰 갱신 시도 중...');
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH.path,
        {
          refresh_token: refreshToken
        }
      );
      
      if (response.access_token) {
        await this.saveToken(response.access_token);
        console.log('✅ 토큰 갱신 성공');
      }
      if (response.refresh_token) {
        await AsyncStorage.setItem('refreshToken', response.refresh_token);
        console.log('✅ Refresh token 업데이트');
      }
      
      return response;
    } catch (error) {
      console.error('❌ 토큰 갱신 실패:', error);
      // 토큰 갱신 실패 시 모든 토큰 제거
      await this.logout();
      throw error;
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      // 토큰들 제거
      await this.removeToken();
      await AsyncStorage.removeItem('refreshToken');
      console.log('✅ 모든 토큰이 성공적으로 제거되었습니다.');
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
      this.token = token;
      await AsyncStorage.setItem('accessToken', token);
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