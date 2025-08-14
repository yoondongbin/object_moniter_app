import axiosInstance from "../../utils/axiosInstance";
import { API_ENDPOINTS } from "../../config/apiConfig";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshRequest,
  User
} from '../../types/api';

// 토큰 스토리지 - 정적 import로 변경
import { 
  setTokens, 
  setAccessToken, 
  getAccessToken,
  getRefreshToken, 
  clearTokens 
} from '../auth/tokenStorage';

class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 현재 액세스 토큰 조회 (AppNavigator에서 사용)
  async getCurrentToken(): Promise<string | null> {
    return await getAccessToken();
  }

  // 로그인
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // 백엔드가 직접 객체를 반환하므로 AuthResponse 타입 사용
      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        { skipAuth: true } // 로그인은 인증 헤더 없이 전송
      );

      const authData = response.data;
      
      // 토큰 저장
      await setTokens(authData.access_token, authData.refresh_token);
      
      console.log('✅ 로그인 성공:', authData.user.username);
      return authData;
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error);
      throw new Error(error.response?.data?.error || '로그인에 실패했습니다.');
    }
  }

  // 회원가입
  async register(userData: RegisterRequest): Promise<{ message: string; user: User }> {
    try {
      // 백엔드가 { message: string, user: User } 형태로 반환
      const response = await axiosInstance.post<{ message: string; user: User }>(
        API_ENDPOINTS.AUTH.REGISTER,
        userData
      );

      console.log('✅ 회원가입 성공:', response.data.user.username);
      return response.data;
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error);
      throw new Error(error.response?.data?.error || '회원가입에 실패했습니다.');
    }
  }

  // 토큰 갱신
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다.');
      }

      // 백엔드가 { access_token: string, message: string } 형태로 반환
      const response = await axiosInstance.post<{ access_token: string; message: string }>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refresh_token: refreshToken }
      );

      const newAccessToken = response.data.access_token;
      
      // 새로운 액세스 토큰 저장
      await setAccessToken(newAccessToken);
      
      console.log('✅ 토큰 갱신 성공');
      return newAccessToken;
    } catch (error: any) {
      console.error('❌ 토큰 갱신 실패:', error);
      // 리프레시 토큰도 만료된 경우 자동 로그아웃
      await this.logout();
      throw new Error('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
    }
  }

  // 로그아웃
  async logout(): Promise<void> {
    try {
      // 토큰 제거
      await clearTokens();
      console.log('✅ 로그아웃 성공');
    } catch (error: any) {
      console.error('❌ 로그아웃 중 오류:', error);
      // 토큰 제거만 실패해도 로그아웃은 진행
      await clearTokens();
    }
  }
}

export const authService = AuthService.getInstance();
export { AuthService };