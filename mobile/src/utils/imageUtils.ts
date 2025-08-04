import { Alert } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { BASE_THUMBNAIL_URL } from '@env';

export const resolveThumbnailUrl = (filename: string): string =>
  `${BASE_THUMBNAIL_URL}${filename}`;

export interface ImagePickerOptions {
  mediaType: MediaType;
  includeBase64: boolean;
  maxHeight: number;
  maxWidth: number;
  quality: any; // PhotoQuality 타입 호환성 문제로 any 사용
}

export interface ImageUtils {
  pickImage: (options?: Partial<ImagePickerOptions>) => Promise<string | null>;
  validateImage: (uri: string) => boolean;
  getImageInfo: (uri: string) => Promise<{ width: number; height: number; size: number } | null>;
}

export const createImageUtils = (): ImageUtils => {
  const pickImage = async (options?: Partial<ImagePickerOptions>): Promise<string | null> => {
    const defaultOptions: ImagePickerOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 1024,
      maxWidth: 1024,
      quality: 0.8,
    };

    const finalOptions = { ...defaultOptions, ...options };

    return new Promise((resolve) => {
      launchImageLibrary(finalOptions, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve(null);
        } else if (response.errorCode) {
          Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
          resolve(null);
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            resolve(asset.uri);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  };

  const validateImage = (uri: string): boolean => {
    // 기본적인 URI 유효성 검사
    if (!uri || typeof uri !== 'string') {
      return false;
    }

    // 파일 확장자 검사
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const hasValidExtension = validExtensions.some(ext => 
      uri.toLowerCase().includes(ext)
    );

    return hasValidExtension;
  };

  const getImageInfo = async (uri: string): Promise<{ width: number; height: number; size: number } | null> => {
    try {
      // React Native에서는 Image.getSize를 사용하여 이미지 크기를 가져올 수 있습니다
      return new Promise((resolve) => {
        const { Image } = require('react-native');
        Image.getSize(uri, (width: number, height: number) => {
          resolve({
            width,
            height,
            size: 0, // 파일 크기는 별도로 계산해야 함
          });
        }, (error: any) => {
          console.error('Failed to get image size:', error);
          resolve(null);
        });
      });
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  };

  return {
    pickImage,
    validateImage,
    getImageInfo,
  };
};

// 싱글톤 인스턴스
export const imageUtils = createImageUtils();