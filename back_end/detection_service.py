import os
import random
import cv2
import numpy as np
import base64
import tempfile
from datetime import datetime
from flask_socketio import emit
from models import db, Object, MonitoringLog, Notification, DetectionResult
from utils import create_alert_notification
from image_service import image_service


class ObjectDetectionService:
    """객체 탐지 및 위험 상태 모니터링 서비스"""

    def __init__(self):
        # 클래스 임시 값
        self.detection_type = [
            'person', 'dangerous_object', 'suspicious_object'
        ]

    def analyze_danger_level(self, detected_objects):
        """탐지된 객체들의 위험도 분석"""
        danger_level = 'safe'
        alert_message = "안전한 상태입니다."

        for obj in detected_objects:
            if obj['confidence'] > 0.6:
                if obj['class'] == 'high_danger':
                    danger_level = 'high'
                    alert_message = f"극도로 위험한 인물이 탐지되었습니다. 도망치세요! (신뢰도: {obj['confidence']:.2f})"
                elif obj['class'] == 'medium_danger':
                    danger_level = 'medium'
                    alert_message = f"위험한 인물이 탐지되었습니다. 주의하세요! (신뢰도: {obj['confidence']:.2f})"
                elif obj['class'] == 'low_danger':
                    danger_level = 'low'
                    alert_message = f"의심스러운 인물이 탐지되었습니다! (신뢰도: {obj['confidence']:.2f})"

        return danger_level, alert_message

    def process_frame(self, detection_result, object_id, user_id):
        """프레임 처리 및 위험 상태 탐지"""
        object_type = random.choice(self.detection_type)
        try:
            detected_objects = []
            if detection_result.get('detected_object', 0) > 0:
                detected_objects.append({
                    'class': detection_result.get('class', 'safe'),
                    'confidence': detection_result.get('confidence', 0.0),
                    'bbox': detection_result.get('bbox_coordinates', [0, 0, 0, 0])
                })

            danger_level, alert_message = self.analyze_danger_level(detected_objects)

            if db.session.is_active:
                db.session.rollback()

            try:
                log_message = f"위험도: {danger_level}, 탐지된 객체: {len(detected_objects)}개"
                if detected_objects:
                    objects_info = ", ".join([f"{obj['class']}({obj['confidence']:.2f})" for obj in detected_objects])
                    log_message += f" - {objects_info}"

                log = MonitoringLog(
                    object_id=object_id,
                    event_type=object_type,
                    message=log_message
                )
                db.session.add(log)



                if detected_objects:
                    for i, obj in enumerate(detected_objects):
                        print(f"🖼️ 객체 {i+1} 처리 중...")
                        
                        # 바운딩 박스 이미지 경로 사용 (이미 저장됨)
                        image_path = detection_result.get('image')
                        print(f"🖼️ 이미지 경로: {image_path}")
                        
                        if not image_path:
                            print("⚠️ 이미지 경로가 없어서 백업 처리")
                            # 백업: 원본 이미지 저장
                            image_data = detection_result.get('image', '')
                            
                            # image_data가 None이거나 빈 문자열인지 확인
                            if not image_data:
                                print("❌ image_data가 없습니다. 기본 이미지 경로 사용")
                                image_path = f"/Users/yunseong/Desktop/React_native/Object_monitor/object_moniter_app/back_end/uploads/detections/{object_id}_{i}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
                            else:
                                if image_data.startswith('data:image'):
                                    image_data = image_data.split(',')[1]

                                image_bytes = base64.b64decode(image_data)
                                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                                temp_file.write(image_bytes)
                                temp_file.close()

                                image_path = f"/Users/yunseong/Desktop/React_native/Object_monitor/object_moniter_app/back_end/uploads/detections/{object_id}_{i}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
                                os.makedirs(os.path.dirname(image_path), exist_ok=True)
                                os.rename(temp_file.name, image_path)
                                print(f"💾 백업 이미지 저장: {image_path}")

                        print(f" 탐지 결과 객체 생성: class={obj['class']}, confidence={obj['confidence']}")
                        detection_result_obj = DetectionResult(
                            object_id=object_id,
                            detection_type=object_type,
                            object_class=obj['class'],
                            confidence=obj['confidence'],
                            bbox_x=obj['bbox'][0],
                            bbox_y=obj['bbox'][1],
                            bbox_width=obj['bbox'][2] - obj['bbox'][0],
                            bbox_height=obj['bbox'][3] - obj['bbox'][1],
                            danger_level=danger_level,
                            image_path=image_path
                        )
                        db.session.add(detection_result_obj)
                        # DetectionResult를 먼저 flush하여 ID 생성
                        db.session.flush()
                        print(f"✅ 탐지 결과 객체 추가됨: ID={detection_result_obj.id}")
                        
                        # 위험한 상황일 때 알림 생성
                        if danger_level != 'safe':
                            notification = Notification(
                                user_id=user_id,
                                detection_id=detection_result_obj.id,  # DetectionResult의 ID 사용
                                title=f"🚨 {danger_level.upper()} 위험",
                                message=alert_message,
                                notification_type=danger_level
                            )
                            db.session.add(notification)
                            print(f"✅ 알림 생성됨: detection_id={detection_result_obj.id}")
                print("데이터베이스 커밋 시도...")
                db.session.commit()
                print(f"✅ 탐지 결과 저장 완료: {len(detected_objects)}개 객체")

            except Exception as e:
                db.session.rollback()
                print(f"❌ 데이터베이스 저장 오류: {str(e)}")

            return {
                'danger_level': danger_level,
                'alert_message': alert_message,
                'detected_objects': detected_objects
            }

        except Exception as e:
            print(f"❌ 탐지 처리 오류: {str(e)}")
            return {
                'danger_level': 'error',
                'alert_message': f'탐지 시스템 오류: {str(e)}',
                'detected_objects': []
            }

    def send_app_notification(self, notification):
        """앱 내부 알림 전송"""
        try:
            notification_data = {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'type': notification.notification_type,
                'object_id': notification.object_id,
                'user_id': notification.user_id,
                'timestamp': notification.created_at.isoformat()
            }
            emit('탐지 알림', notification_data, room=f'user_{notification.user_id}')
            print(f"📱 앱 알림 전송: {notification.title}")
            return True
        except Exception as e:
            print(f"❌ 앱 알림 전송 실패: {str(e)}")
            return False


# 전역 인스턴스
detection_service = ObjectDetectionService()
