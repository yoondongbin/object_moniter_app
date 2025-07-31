import os
import cv2
import numpy as np
from datetime import datetime
from flask import current_app
import base64
from PIL import Image
import io

class ImageService:
    """이미지 저장 및 관리 서비스"""
    
    def __init__(self):
        # 이미지 저장 디렉토리 설정
        self.upload_folder = 'uploads'
        self.detection_folder = 'uploads/detections'
        self.ensure_directories()
    
    def ensure_directories(self):
        """필요한 디렉토리 생성"""
        os.makedirs(self.upload_folder, exist_ok=True)
        os.makedirs(self.detection_folder, exist_ok=True)
    
    def save_detection_image(self, frame, object_id, detection_id):
        """탐지된 이미지 저장"""
        try:
            # 파일명 생성 (object_id_detection_id_timestamp.jpg)
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"{object_id}_{detection_id}_{timestamp}.jpg"
            filepath = os.path.join(self.detection_folder, filename)
            
            # OpenCV 이미지를 파일로 저장
            cv2.imwrite(filepath, frame)
            
            # 상대 경로 반환 (데이터베이스 저장용)
            relative_path = f"detections/{filename}"
            
            print(f"✅ 이미지 저장 완료: {filepath}")
            return relative_path
            
        except Exception as e:
            print(f"❌ 이미지 저장 오류: {str(e)}")
            return None
    
    def save_base64_image(self, base64_data, object_id, detection_id):
        """Base64 인코딩된 이미지 저장"""
        try:
            # Base64 디코딩
            image_data = base64.b64decode(base64_data.split(',')[1] if ',' in base64_data else base64_data)
            
            # PIL Image로 변환
            image = Image.open(io.BytesIO(image_data))
            
            # 파일명 생성
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            filename = f"{object_id}_{detection_id}_{timestamp}.jpg"
            filepath = os.path.join(self.detection_folder, filename)
            
            # JPEG로 저장
            image.save(filepath, 'JPEG', quality=85)
            
            relative_path = f"detections/{filename}"
            print(f"✅ Base64 이미지 저장 완료: {filepath}")
            return relative_path
            
        except Exception as e:
            print(f"❌ Base64 이미지 저장 오류: {str(e)}")
            return None
    
    def get_image_url(self, image_path):
        """이미지 URL 생성"""
        if not image_path:
            return None
        
        # 실제 서버에서는 정적 파일 서빙 설정 필요
        return f"/uploads/{image_path}"
    
    def delete_image(self, image_path):
        """이미지 파일 삭제"""
        try:
            if image_path and os.path.exists(image_path):
                os.remove(image_path)
                print(f"✅ 이미지 삭제 완료: {image_path}")
                return True
        except Exception as e:
            print(f"❌ 이미지 삭제 오류: {str(e)}")
        
        return False

# 전역 서비스 인스턴스
image_service = ImageService() 