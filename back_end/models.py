from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    """사용자 모델"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
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
    status = db.Column(db.String(20), default='inactive')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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
    detection_id = db.Column(db.Integer, db.ForeignKey('detection_result.id'), nullable=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='notifications')
    detection = db.relationship('DetectionResult', backref='notifications')
    
    def to_dict(self):
        """알림 정보를 딕셔너리로 변환"""
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'detection_id': self.detection_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        return result

class DetectionResult(db.Model):
    """객체 탐지 결과 모델"""
    id = db.Column(db.Integer, primary_key=True)
    object_id = db.Column(db.Integer, db.ForeignKey('object.id'), nullable=False)
    detection_type = db.Column(db.String(50), nullable=False)
    object_class = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False) 
    bbox_x = db.Column(db.Integer)
    bbox_y = db.Column(db.Integer)
    bbox_width = db.Column(db.Integer)
    bbox_height = db.Column(db.Integer)
    danger_level = db.Column(db.String(20), nullable=False) 
    image_path = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    object = db.relationship('Object', backref='detection_results')
    
    def to_dict(self):
        """탐지 결과를 딕셔너리로 변환"""
        # 이미지 URL 생성
        image_url = None
        if self.image_path:
            from flask import request
            if request:
                # 현재 요청의 호스트를 기반으로 URL 생성
                base_url = f"{request.scheme}://{request.host}"
                image_url = f"{base_url}/uploads/{self.image_path}"
            else:
                # 요청 컨텍스트가 없는 경우 상대 경로로 반환
                image_url = f"/uploads/{self.image_path}"
        
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
            'image_path': image_url,  # HTTP URL로 변환
            'created_at': self.created_at.isoformat() if self.created_at else None
        }