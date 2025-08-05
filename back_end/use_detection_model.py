import os
import random
import cv2
import numpy as np
import base64
from ultralytics import YOLO
from datetime import datetime

# 모델 불러오기 (YOLOv8n은 경량화된 버전)
class Use_detection_model:

    def __init__(self):
        current_dir = os.path.dirname(__file__)
        self.image_folder = os.path.join(current_dir, "image")
        self.model_path = os.path.join(current_dir, "yolov8n.pt")
        
        self.model = YOLO(self.model_path)
        
        if not os.path.exists(self.image_folder):
            print(f"이미지 폴더가 존재 하지 않습니다: {self.image_folder}")
            self.png_files = []
        else:
            self.png_files = [f for f in os.listdir(self.image_folder) if f.endswith('.png')]
        
        self.class_name = ['high_danger', 'medium_danger', 'low_danger']
        
    def get_random_image(self):
        """랜덤 이미지 선택"""
        if self.png_files:
            random_image = random.choice(self.png_files)
            image_path = os.path.join(self.image_folder, random_image)
            print(f"선택된 이미지: {random_image}")
            return image_path
        else:
            print("image 폴더에 이미지 파일이 없습니다.")
            return None

    def image_to_base64(self, image):
        """OpenCV 이미지를 base64 문자열로 변환"""
        # 이미지를 JPEG 형식으로 인코딩
        _, buffer = cv2.imencode('.jpg', image)
        # base64로 인코딩
        jpg_as_text = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{jpg_as_text}"

    def detect_object(self, object_id):
        image_path = self.get_random_image()
        results = self.model(image_path)
        
        # 이미지 로드
        image = cv2.imread(image_path)
        if image is None:
            print(f"이미지를 로드할 수 없습니다: {image_path}")
            return None
        
        # 사람 클래스만 필터링하고 첫 번째 객체에만 바운딩 박스 그리기
        person_count = 0
        detected_info = {
            'confidence': 0.0,
            'class': '0',
            'detected_object': 0,
            'bbox_coordinates': None
        }
        
        for result in results:
            boxes = result.boxes
            
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0].cpu().numpy())
                    confidence = box.conf[0].cpu().numpy()
                    
                    if class_id == 0:  # 0: 'person' in COCO
                        if person_count == 0:  # 첫 번째 사람 객체만 처리
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                            
                            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 3)
                            
                            label = f"confidence:{confidence:.2f}"
                            cv2.putText(image, label, (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                            
                            # 탐지 정보 업데이트
                            detected_info['confidence'] = float(confidence)
                            detected_info['detected_object'] = 1
                            detected_info['class'] = random.choice(self.class_name)
                            detected_info['bbox_coordinates'] = [int(x1), int(y1), int(x2), int(y2)]
                            
                            person_count += 1
                            break  # 첫 번째 사람 객체만 처리하고 종료
        
        if person_count == 0:
            print("사람이 탐지되지 않았습니다.")
        
        if object_id is not None:
            uploads_dir = os.path.join(os.path.dirname(__file__), "uploads", "detections")
            os.makedirs(uploads_dir, exist_ok=True)
            
            timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
            detection_filename = f"{object_id}_{timestamp}.jpg"
            detection_path = os.path.join(uploads_dir, detection_filename)
            
            # 바운딩 박스가 씌워진 이미지 저장
            cv2.imwrite(detection_path, image)
            print(f"바운딩 박스 이미지 저장: {detection_path}")
        else:
            detection_path = None

        # 이미지를 base64로 변환
        base64_image = self.image_to_base64(image)
        
        # 결과 딕셔너리 생성
        result = {
            'image': base64_image,
            'image_path': detection_path,
            'confidence': detected_info['confidence'],
            'class': detected_info['class'],
            'detected_object': detected_info['detected_object'],
            'bbox_coordinates': detected_info['bbox_coordinates']
        }
        
        return result


use_detection_model = Use_detection_model()