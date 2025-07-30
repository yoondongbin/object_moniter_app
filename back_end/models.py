from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """사용자 모델"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 관계 설정
    objects = db.relationship('Object', backref='user', lazy=True)
    
    def to_dict(self):
        """사용자 정보를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Object(db.Model):
    """모니터링 대상 객체 모델"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    logs = db.relationship('MonitoringLog', backref='object', lazy=True)
    
    def to_dict(self):
        """객체 정보를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'status': self.status,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MonitoringLog(db.Model):
    """모니터링 로그 모델"""
    id = db.Column(db.Integer, primary_key=True)
    object_id = db.Column(db.Integer, db.ForeignKey('object.id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """로그 정보를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'object_id': self.object_id,
            'event_type': self.event_type,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }

class Notification(db.Model):
    """알림 모델"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    object_id = db.Column(db.Integer, db.ForeignKey('object.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # 'error', 'warning', 'info'
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 관계 설정
    user = db.relationship('User', backref='notifications')
    object = db.relationship('Object', backref='notifications')
    
    def to_dict(self):
        """알림 정보를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'object_id': self.object_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DetectionResult(db.Model):
    """객체 탐지 결과 모델"""
    id = db.Column(db.Integer, primary_key=True)
    object_id = db.Column(db.Integer, db.ForeignKey('object.id'), nullable=False)
    detection_type = db.Column(db.String(50), nullable=False)  # 'dangerous_object', 'suspicious_activity'
    object_class = db.Column(db.String(100), nullable=False)   # 'knife', 'gun', 'suspicious_person'
    confidence = db.Column(db.Float, nullable=False)           # 탐지 신뢰도 (0.0 ~ 1.0)
    bbox_x = db.Column(db.Integer)                            # 바운딩 박스 X 좌표
    bbox_y = db.Column(db.Integer)                            # 바운딩 박스 Y 좌표
    bbox_width = db.Column(db.Integer)                        # 바운딩 박스 너비
    bbox_height = db.Column(db.Integer)                       # 바운딩 박스 높이
    danger_level = db.Column(db.String(20), nullable=False)   # 'safe', 'medium', 'high', 'critical'
    image_path = db.Column(db.String(500))                    # 탐지된 이미지 경로
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # 관계 설정
    object = db.relationship('Object', backref='detection_results')
    
    def to_dict(self):
        """탐지 결과를 딕셔너리로 변환"""
        return {
            'id': self.id,
            'object_id': self.object_id,
            'detection_type': self.detection_type,
            'object_class': self.object_class,
            'confidence': self.confidence,
            'bbox': {
                'x': self.bbox_x,
                'y': self.bbox_y,
                'width': self.bbox_width,
                'height': self.bbox_height
            },
            'danger_level': self.danger_level,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }