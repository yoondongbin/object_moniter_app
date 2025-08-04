import os
import random
import cv2
import numpy as np
import base64
import tempfile
from datetime import datetime
from flask_socketio import emit
from models import db, Object, MonitoringLog, Notification, DetectionResult
from routes import create_alert_notification
from image_service import image_service


class ObjectDetectionService:
    """객체 탐지 및 위험 상태 모니터링 서비스"""

    def __init__(self):
        self.dangerous_objects = ['knife', 'gun', 'suspicious_person']

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
                    event_type='danger_detection',
                    message=log_message
                )
                db.session.add(log)

                if detected_objects:
                    for i, obj in enumerate(detected_objects):
                        image_data = detection_result.get('image', '')
                        if image_data.startswith('data:image'):
                            image_data = image_data.split(',')[1]

                        image_bytes = base64.b64decode(image_data)
                        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                        temp_file.write(image_bytes)
                        temp_file.close()

                        image_path = f"/Users/yunseong/Desktop/React_native/Object_monitor/object_moniter_app/back_end/uploads/detections/{object_id}_{i}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.jpg"
                        os.makedirs(os.path.dirname(image_path), exist_ok=True)
                        os.rename(temp_file.name, image_path)

                        detection_result_obj = DetectionResult(
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
                        db.session.add(detection_result_obj)

                if danger_level != 'safe':
                    notification_type = 'danger' if danger_level == 'high' else 'warning'
                    title = '🚨 위험 상태' if danger_level == 'high' else '🚨🚨 긴급 상황'
                    notification = Notification(
                        user_id=user_id,
                        object_id=object_id,
                        title=title,
                        message=alert_message,
                        notification_type=notification_type
                    )
                    db.session.add(notification)

                db.session.commit()

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
