import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getApiConfig, AUTH_REQUIRED_PATTERNS } from '../../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API 클라이언트 클래스
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

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
        
        // 인증이 필요한 경우에만 토큰 추가
        if (requiresAuth) {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        console.log('API Request:', requestConfig.method?.toUpperCase(), requestConfig.url);
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
      (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        
        // 401 에러 처리 (토큰 만료 등)
        if (error.response?.status === 401) {
          // 토큰 갱신 로직
          // await this.refreshToken();
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