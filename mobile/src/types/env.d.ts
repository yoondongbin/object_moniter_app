//Config.API_BASE_URL 자동완성/타입 경고 제거
declare module 'react-native-config' {
  interface NativeConfig {
    API_BASE_URL?: string;
    TIMEOUT?: string;
    APP_ENV?: string;
    DEBUG_MODE?: string;
    ENABLE_FLIPPER?: string;
    LOG_LEVEL?: string;
    FIREBASE_API_KEY?: string;
    FIREBASE_PROJECT_ID?: string;
  }
  const Config: NativeConfig;
  export default Config;
}