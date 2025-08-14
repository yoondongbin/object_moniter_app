import 'axios';

// Axios 기본 타입에 우리가 쓸 커스텀 키를 추가
// skipAuth: 토큰 자동 첨부와 401-리프레시 로직을 건너뜀
// _retry: 401 발생 시 내부 재시도 여부를 표시(무한루프 방지)
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    _retry?: boolean;
  }
}