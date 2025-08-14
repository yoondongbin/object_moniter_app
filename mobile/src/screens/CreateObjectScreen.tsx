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
import { objectService, type CreateObjectRequest } from '../services/api';
import styles from '../styles/CreateObjectScreen.styles';

const CreateObjectScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateObject = async () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '객체 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const objectData: CreateObjectRequest = {
        name: name.trim(),
        description: description.trim() || '',
      };

      const response = await objectService.createObject(objectData);
      
      Alert.alert('성공', '객체가 생성되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            // 객체 관리 페이지로 명시적으로 돌아가기
            navigation.navigate('ObjectList');
          },
        },
      ]);
    } catch (error: any) {
      console.error('객체 생성 오류:', error);
      let errorMessage = '객체 생성에 실패했습니다. 다시 시도해주세요.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('객체 생성 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>새 객체 생성</Text>
            <Text style={styles.subtitle}>모니터링할 객체를 추가하세요</Text>
          </View>

          {/* 폼 */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>객체 이름 *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="객체 이름을 입력하세요"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>설명</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="객체에 대한 설명을 입력하세요 (선택사항)"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            {/* 버튼 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.createButton, isLoading && styles.createButtonDisabled]}
                onPress={handleCreateObject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.createButtonText}>생성</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateObjectScreen;