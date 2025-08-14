import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { authService } from '../services/api/authApi';
import type { LoginRequest } from '../types/api';
import styles from '../styles/LoginScreen.styles';

const LoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('입력 오류', '사용자명과 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        username: username.trim(),
        password: password,
      };

      const response = await authService.login(loginData);
      
      if (response.access_token) {
        // 토큰이 성공적으로 저장되었는지 확인
        const savedToken = await authService.getCurrentToken();
        if (savedToken) {
          Alert.alert('로그인 성공', '환영합니다!', [
            {
              text: '확인',
              onPress: () => {
                console.log('✅ 로그인 완료 - AppNavigator에서 자동으로 화면 전환');
                // AppNavigator에서 토큰 상태 변화를 감지하여 자동으로 메인 화면으로 이동
              },
            },
          ]);
        } else {
          Alert.alert('로그인 실패', '토큰 저장에 실패했습니다. 다시 시도해주세요.');
        }
      } else {
        Alert.alert('로그인 실패', '로그인에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 로고/제목 영역 */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>객체 모니터링</Text>
            <Text style={styles.subtitle}>안전한 환경을 위한 AI 기반 객체 탐지</Text>
          </View>

          {/* 로그인 폼 */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>사용자명</Text>
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="사용자명을 입력하세요"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>비밀번호</Text>
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 회원가입 링크 */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>계정이 없으신가요? </Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.registerLink}>회원가입</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
