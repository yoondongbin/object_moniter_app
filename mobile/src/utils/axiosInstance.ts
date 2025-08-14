import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { getApiConfig } from '../config/apiConfig';
import { 
  getAccessToken, 
  getRefreshToken, 
  setTokens, 
  clearTokens 
} from '../services/auth/tokenStorage';

// 환경 설정에서 baseURL과 timeout 가져오기
const config = getApiConfig();

const axiosInstance = axios.create({
  baseURL: config.BASE_URL,
  timeout: config.TIMEOUT,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Platform': Platform.OS,
  },
});

let refreshingPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.warn('리프레시 토큰이 없습니다.');
        return null;
      }

      // 서버는 리프레시 토큰을 Authorization 헤더로 받음 (@jwt_required(refresh=True))
      const response = await axios.post(
        `${config.BASE_URL}/api/auth/refresh`,
        null,
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );

      const { access_token, refresh_token } = (response as any).data || {};
      
      if (access_token) {
        await setTokens(access_token, refresh_token);
        console.log('토큰 갱신 성공');
        return access_token;
      }
      
      return null;
    } catch (error) {
      console.error('토큰 갱신 실패:', error);
      await clearTokens();
      return null;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if(config.skipAuth) {
      return config;
    }

    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if(__DEV__) {
      console.log('api 요청:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token,
      })
    }
    return config
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response) => {
    if(__DEV__) {
      console.log('api 응답:', {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if(status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if(newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }else{
        await clearTokens();
        // TODO: 네비게이션을 통한 로그인 화면 이동
      }
    }

    const serverMessage = (error.response?.data as any)?.error || (error.response?.data as any)?.detail;
    const logPayload = {
      status,
      url: originalRequest?.url,
      message: serverMessage || error.message,
    };
    console.warn('api 에러:', logPayload);

    return Promise.reject(error);
  }
);

export default axiosInstance;