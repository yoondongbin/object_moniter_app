import os
import random
import cv2
import numpy as np
import base64
from ultralytics import YOLO

# 모델 불러오기 (YOLOv8n은 경량화된 버전)
class Use_detection_model:

    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        self.image_folder = '/Users/yunseong/Desktop/React_native/Object_monitor/object_moniter_app/back_end/image'
        self.png_files = [f for f in os.listdir(self.image_folder) if f.endswith('.png')]
        self.class_name = ['high_danger', 'medium_danger', 'low_danger']
        
    def get_random_image(self):
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

    def detect_object(self, image_path):
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
                            # 바운딩 박스 좌표 추출
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                            
                            # 바운딩 박스 그리기
                            cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 3)
                            
                            # 라벨 추가
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
        
        # 이미지를 base64로 변환
        base64_image = self.image_to_base64(image)
        
        # 결과 딕셔너리 생성
        result = {
            'image': base64_image,
            'confidence': detected_info['confidence'],
            'class': detected_info['class'],
            'detected_object': detected_info['detected_object'],
            'bbox_coordinates': detected_info['bbox_coordinates']
        }
        
        return result


use_detection_model = Use_detection_model()

if __name__ == "__main__":
    # 무작위 이미지 선택
    image_path = use_detection_model.get_random_image()
    
    if image_path:
        # 객체 탐지 및 바운딩 박스 그리기
        result = use_detection_model.detect_object(image_path)
        
        if result is not None:
            print("=== 탐지 결과 ===")
            print(f"탐지된 객체 수: {result['detected_object']}")
            print(f"클래스: {result['class']}")
            print(f"신뢰도: {result['confidence']:.2f}")
            print(f"바운딩 박스 좌표: {result['bbox_coordinates']}")
            print(f"Base64 이미지 길이: {len(result['image'])}")
            
            # 테스트용으로 파일로도 저장
            import base64
            # base64에서 이미지 데이터 추출
            image_data = result['image']
            if image_data.startswith('data:image'):
                image_data = image_data.split(',')[1]
            decoded_image = base64.b64decode(image_data)
            with open("/Users/yunseong/Desktop/React_native/Object_monitor/object_moniter_app/back_end/image/result_img/result_with_bbox.jpg", "wb") as f:
                f.write(decoded_image)
            print("테스트용 이미지 파일도 저장되었습니다.")
        else:
            print("객체 탐지에 실패했습니다.")
    else:
        print("이미지를 선택할 수 없습니다.")
