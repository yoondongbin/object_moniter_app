from models import db, Notification
from datetime import datetime

def create_alert_notification(user_id, object_id, title, message, notification_type='danger'):
    """알림 생성 유틸리티 함수"""
    try:
        notification = Notification(
            user_id=user_id,
            object_id=object_id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        
        db.session.add(notification)
        db.session.commit()
        
        print(f"✅ 알림 생성 완료: {title}")
        return notification
        
    except Exception as e:
        print(f"❌ 알림 생성 실패: {str(e)}")
        db.session.rollback()
        return None 