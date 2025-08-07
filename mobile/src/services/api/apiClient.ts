import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiConfig, AUTH_REQUIRED_PATTERNS } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authApi';

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    const apiConfig = getApiConfig();
    this.baseURL = apiConfig.BASE_URL;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: apiConfig.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // 요청 인터셉터
    this.client.interceptors.request.use(
      async (requestConfig) => {
        // 인증이 필요한 엔드포인트인지 확인
        const requiresAuth = AUTH_REQUIRED_PATTERNS.some(endpoint => 
          requestConfig.url?.includes(endpoint)
        );
        
        console.log('요청 URL:', requestConfig.url);
        console.log('인증 필요:', requiresAuth);

        // 인증이 필요한 경우에만 토큰 추가
        if (requiresAuth) {
          const token = await AsyncStorage.getItem('accessToken');
          console.log('저장된 토큰:', token ? token.substring(0, 20) + '...' : '없음');
          if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
          } else {
            console.error('토큰이 없습니다.');
          }
        }

        console.log('최종 요청 설정:', {
          method: requestConfig.method,
          url: requestConfig.url,
          headers: requestConfig.headers
        });
        console.log('=== 요청 인터셉터 끝 ===');
        
        return requestConfig;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 응답 인터셉터
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      async (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        
        const originalRequest = error.config;
        
        // 401 에러 처리 (토큰 만료 등)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 이미 토큰 갱신 중이면 대기
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // 토큰 갱신 시도
            await authService.refreshToken();
            
            // 대기 중인 요청들 처리
            this.failedQueue.forEach(({ resolve }) => {
              resolve();
            });
            this.failedQueue = [];
            
            // 원래 요청 재시도
            const newToken = await AsyncStorage.getItem('accessToken');
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            return this.client(originalRequest);
          } catch (refreshError) {
            console.error('토큰 갱신 실패:', refreshError);
            
            // 대기 중인 요청들 실패 처리
            this.failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            this.failedQueue = [];
            
            // 만료된 토큰들 삭제
            await authService.logout();
            
            // 로그아웃 이벤트 발생 (AppNavigator에서 감지)
            console.log('🔐 토큰 만료로 인한 자동 로그아웃');
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // GET 요청
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  // POST 요청
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  // PUT 요청
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  // DELETE 요청
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // PATCH 요청
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  // 파일 업로드
  async uploadFile<T>(url: string, file: any, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();
export default apiClient; 