import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { authService } from './src/services/api/authApi';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      const response = await authService.login({
        username: 'myuser',  // email 대신 username 사용
        password: 'mypassword123'
      });
      console.log(response);
      // response.data.token 대신 response.data.access_token 사용
      if (response && response.access_token) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('자동 로그인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>초기화 중...</Text>
      </View>
    );
  }

  return isLoggedIn ? <AppNavigator /> : <Text>로그인 실패</Text>;
}