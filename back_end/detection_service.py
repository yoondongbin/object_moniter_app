import cv2
import numpy as np
from datetime import datetime
from models import db, Object, MonitoringLog, Notification, DetectionResult
from routes import create_alert_notification
from image_service import image_service

class ObjectDetectionService:
    """객체 탐지 및 위험 상태 모니터링 서비스"""
    
    def __init__(self):
        # YOLO 모델 로드 (예시)
        # self.model = cv2.dnn.readNet("yolov5s.weights", "yolov5s.cfg")
        self.dangerous_objects = ['knife', 'gun', 'suspicious_person']
        self.alert_threshold = 0.8  # 위험 탐지 임계값
        
    def detect_dangerous_objects(self, frame):
        """프레임에서 위험 객체 탐지"""
        # 실제 YOLO 탐지 로직 (예시)
        # detections = self.model.forward()
        
        # 시뮬레이션: 위험 객체 탐지
        detected_objects = []
        
        # 예시: 랜덤하게 위험 객체 탐지 시뮬레이션
        import random
        detected_objects.append({
            'class': random.choice(self.dangerous_objects),
            'confidence': random.uniform(0.7, 0.95),
            'bbox': [100, 100, 200, 200]
        })
        
        return detected_objects
    
    def analyze_danger_level(self, detected_objects):
        """탐지된 객체들의 위험도 분석"""
        danger_level = 'safe'
        alert_message = "안전한 상태입니다."
        
        for obj in detected_objects:
            if obj['confidence'] > self.alert_threshold:
                if obj['class'] == 'knife':
                    danger_level = 'high'
                    alert_message = f"🔪 칼이 탐지되었습니다! (신뢰도: {obj['confidence']:.2f})"
                elif obj['class'] == 'gun':
                    danger_level = 'critical'
                    alert_message = f"🔫 총기가 탐지되었습니다! (신뢰도: {obj['confidence']:.2f})"
                elif obj['class'] == 'suspicious_person':
                    danger_level = 'medium'
                    alert_message = f"⚠️ 의심스러운 인물이 탐지되었습니다! (신뢰도: {obj['confidence']:.2f})"
        
        return danger_level, alert_message
    
    def process_frame(self, frame, object_id, user_id):
        """프레임 처리 및 위험 상태 탐지 (트랜잭션 통합)"""
        try:
            # 1. 위험 객체 탐지
            detected_objects = self.detect_dangerous_objects(frame)
            # 2. 위험도 분석
            danger_level, alert_message = self.analyze_danger_level(detected_objects)

            # 3. 기존 트랜잭션 확인 및 정리
            if db.session.is_active:
                db.session.rollback()
            
            # 4. 새로운 트랜잭션에서 모든 데이터 생성
            try:
                # MonitoringLog 생성 (탐지 결과에 따라 위험도 결정)
                log_message = f"위험도: {danger_level}, 탐지된 객체: {len(detected_objects)}개"
                if detected_objects:
                    objects_info = ", ".join([f"{obj['class']}({obj['confidence']:.2f})" for obj in detected_objects])
                    log_message += f" - {objects_info}"
                log = MonitoringLog(
                    object_id=object_id,
                    event_type='danger_detection',
                    message=log_message
                )
                db.session.add(log)

                # DetectionResult 생성 (탐지된 객체가 있을 때만)
                if detected_objects:
                    for i, obj in enumerate(detected_objects):
                        annotated_frame = image_service.draw_detection_boxes(frame, detected_objects)
                        image_path = image_service.save_detection_image(annotated_frame, object_id, f"{i}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}")
                        detection_result = DetectionResult(
                            object_id=object_id,
                            detection_type='dangerous_object',
                            object_class=obj['class'],
                            confidence=obj['confidence'],
                            bbox_x=obj['bbox'][0],
                            bbox_y=obj['bbox'][1],
                            bbox_width=obj['bbox'][2] - obj['bbox'][0],
                            bbox_height=obj['bbox'][3] - obj['bbox'][1],
                            danger_level=danger_level,
                            image_path=image_path
                        )
                        db.session.add(detection_result)

                # Notification 생성 (위험 상태일 때만)
                if danger_level != 'safe':
                    notification_type = 'warning' if danger_level == 'high' else 'error'
                    title = '🚨 위험 상태' if danger_level == 'high' else '🚨🚨 긴급 상황'
                    notification = Notification(
                        user_id=user_id,
                        object_id=object_id,
                        title=title,
                        message=alert_message,
                        notification_type=notification_type
                    )
                    db.session.add(notification)

                # 트랜잭션 커밋
                db.session.commit()

            except Exception as e:
                db.session.rollback()
                print(f"❌ 데이터베이스 저장 오류: {str(e)}")
                # 데이터베이스 오류가 있어도 탐지 결과는 반환
                pass

            return {
                'danger_level': danger_level,
                'detected_objects': detected_objects,
                'alert_message': alert_message
            }
            
        except Exception as e:
            if db.session.is_active:
                db.session.rollback()
            print(f"❌ 탐지 오류: {str(e)}")
            return {
                'danger_level': 'error',
                'detected_objects': [],
                'alert_message': f"탐지 시스템 오류: {str(e)}"
            }

# 전역 서비스 인스턴스
detection_service = ObjectDetectionService() 