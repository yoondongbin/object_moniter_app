import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
} as const;

export async function setTokens(access: string, refresh?: string | null): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.ACCESS, access);
    if (typeof refresh === 'string') {
      await AsyncStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
    }
  } catch (error) {
    console.error('토큰 저장 실패:', error);
    throw error;
  }
}

export async function setAccessToken(access: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEYS.ACCESS, access);
  } catch (error) {
    console.error('액세스 토큰 저장 실패:', error);
    throw error;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEYS.ACCESS);
  } catch (error) {
    console.error('액세스 토큰 조회 실패:', error);
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEYS.REFRESH);
  } catch (error) {
    console.error('리프레시 토큰 조회 실패:', error);
    return null;
  }
}

export async function clearTokens(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEYS.ACCESS, TOKEN_KEYS.REFRESH]);
  } catch (error) {
    console.error('토큰 삭제 실패:', error);
    throw error;
  }
}