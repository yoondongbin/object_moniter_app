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
import { useRoute } from '@react-navigation/native';
import { ObjectService, type ObjectData } from '../services/api/objectApi';
import styles from '../styles/EditObjectScreen.styles';

const EditObjectScreen = ({ navigation }: any) => {
  const route = useRoute();
  const { object } = route.params as { object: ObjectData };
  
  const [name, setName] = useState(object.name || '');
  const [description, setDescription] = useState(object.description || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (object) {
      setName(object.name || '');
      setDescription(object.description || '');
    }
  }, [object]);

  const handleUpdateObject = async () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '객체 이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const objectService = ObjectService.getInstance();
      const objectData: Partial<ObjectData> = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      const response = await objectService.updateObject(object.id!, objectData);
      
      if (response.success) {
        Alert.alert('성공', '객체가 수정되었습니다!', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('실패', '객체 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error: any) {
      console.error('객체 수정 오류:', error);
      let errorMessage = '객체 수정에 실패했습니다. 다시 시도해주세요.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
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
            <Text style={styles.subtitle}>객체 정보를 수정하세요</Text>
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

            {/* 현재 상태 표시 */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>현재 상태</Text>
              <View style={[styles.statusBadge, { backgroundColor: object.status === 'active' ? '#10B981' : '#9CA3AF' }]}>
                <Text style={styles.statusText}>
                  {object.status === 'active' ? '활성' : '비활성'}
                </Text>
              </View>
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
