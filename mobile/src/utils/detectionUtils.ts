import { Alert } from 'react-native';
import { DetectionService } from '../services/api/detectionApi';
import { imageUtils } from './imageUtils';

export interface DetectionUtils {
  handleImagePicker: () => Promise<string | null>;
  handleStartDetection: (
    imagePath: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => Promise<void>;
  handleClearImage: () => void;
}

export const createDetectionUtils = (): DetectionUtils => {
  const handleImagePicker = async (): Promise<string | null> => {
    return await imageUtils.pickImage();
  };

  // 이미지를 Base64로 변환하는 함수
  const convertImageToBase64 = async (imagePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
          const base64data = reader.result as string;
          // "data:image/jpeg;base64," 부분을 제거하고 순수 Base64만 반환
          const base64 = base64data.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = function() {
        reject(new Error('Failed to load image'));
      };
      xhr.open('GET', imagePath);
      xhr.responseType = 'blob';
      xhr.send();
    });
  };

  const handleStartDetection = async (
    imagePath: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ): Promise<void> => {
    if (!imagePath.trim()) {
      onError('이미지를 선택해주세요.');
      return;
    }

    // 이미지 유효성 검사
    if (!imageUtils.validateImage(imagePath)) {
      onError('유효하지 않은 이미지입니다.');
      return;
    }

    try {
      const detectionService = DetectionService.getInstance();
      // 기본 objectId를 1로 설정 (실제로는 사용자가 선택한 객체 ID를 사용해야 함)
      detectionService.setObjectId(1);

      const base64Image = await convertImageToBase64(imagePath);

      // Base64 이미지를 JSON으로 전송
      const detectionData = {
        image_data: base64Image,
        image_format: 'jpeg'
      };

      await detectionService.createDetection();
      
      Alert.alert('탐지 완료', '객체 탐지가 완료되었습니다.', [
        {
          text: '확인',
          onPress: onSuccess,
        },
      ]);
    } catch (error) {
      console.error('Detection error:', error);
      onError('객체 탐지 중 오류가 발생했습니다.');
    }
  };

  const handleClearImage = (): void => {
    // 이미지 클리어 로직은 상태 관리를 위해 컴포넌트에서 처리
    console.log('Image cleared');
  };

  return {
    handleImagePicker,
    handleStartDetection,
    handleClearImage,
  };
};

// 싱글톤 인스턴스
export const detectionUtils = createDetectionUtils();