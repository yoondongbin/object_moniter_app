import React, { useState, useEffect } from 'react';
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
import { objectService, type ObjectData, type UpdateObjectRequest } from '../services/api';
import styles from '../styles/EditObjectScreen.styles';

const EditObjectScreen = ({ route, navigation }: any) => {
  const { object } = route.params;
  const [name, setName] = useState(object?.name || '');
  const [description, setDescription] = useState(object?.description || '');
  const [status, setStatus] = useState(object?.status || 'inactive');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateObject = async () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '객체 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const updateData: UpdateObjectRequest = {
        name: name.trim(),
        description: description.trim() || '',
        status: status as 'active' | 'inactive',
      };

      const response = await objectService.updateObject(object.id, updateData);
      
      Alert.alert('성공', '객체가 수정되었습니다!', [
        {
          text: '확인',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('객체 수정 오류:', error);
      let errorMessage = '객체 수정에 실패했습니다. 다시 시도해주세요.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('객체 수정 실패', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const toggleStatus = () => {
    setStatus(status === 'active' ? 'inactive' : 'active');
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
            <Text style={styles.title}>객체 수정</Text>
            <Text style={styles.subtitle}>객체 정보를 편집하세요</Text>
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

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>상태</Text>
              <TouchableOpacity
                style={[
                  styles.textInput, 
                  { 
                    backgroundColor: status === 'active' ? '#10B981' : '#6B7280',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 12
                  }
                ]}
                onPress={toggleStatus}
                disabled={isLoading}
              >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {status === 'active' ? '활성' : '비활성'}
                </Text>
              </TouchableOpacity>
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
                style={[styles.button, styles.updateButton, isLoading && styles.updateButtonDisabled]}
                onPress={handleUpdateObject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.updateButtonText}>수정</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditObjectScreen;