from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Object, MonitoringLog, Notification, DetectionResult
from image_service import image_service
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
objects_bp = Blueprint('objects', __name__, url_prefix='/api/objects')
logs_bp = Blueprint('logs', __name__, url_prefix='/api/objects')
notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # JWT 토큰 생성
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': user.to_dict(),
            'message': 'Login successful'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh Token으로 새로운 Access Token 발급"""
    try:
        current_user_id = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': new_access_token,
            'message': 'Token refreshed successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Token refresh failed'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({'error': 'Username, email and password are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        if User.query.filter_by(username=username).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        password_hash = generate_password_hash(password)
        
        new_user = User(
            username=username,
            email=email,
            password_hash=password_hash
        )
        
        from models import db
        db.session.add(new_user)
        db.session.commit()
        print(f"✅ 유저 생성 완료: {new_user.to_dict()}")
        return jsonify({
            'message': 'User created successfully',
            'user': new_user.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 

@objects_bp.route('/', methods=['GET'])
@jwt_required()
def get_objects():
    """사용자의 모든 객체 조회"""
    user_id = get_jwt_identity()
    objects = Object.query.filter_by(user_id=user_id).order_by(Object.created_at.desc()).all()
    
    return jsonify([obj.to_dict() for obj in objects])

@objects_bp.route('/<int:object_id>', methods=['GET'])
@jwt_required()
def get_object(object_id):
    """특정 객체 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    return jsonify(obj.to_dict())

@objects_bp.route('/<int:object_id>', methods=['PUT'])
@jwt_required()
def update_object(object_id):
    """객체 정보 수정"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    data = request.get_json()
    
    if data.get('name'):
        obj.name = data['name']
    if data.get('description'):
        obj.description = data['description']
    if data.get('status'):
        obj.status = data['status']
    
    db.session.commit()
    
    return jsonify(obj.to_dict())

@objects_bp.route('/<int:object_id>', methods=['DELETE'])
@jwt_required()
def delete_object(object_id):
    """객체 삭제"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    db.session.delete(obj)
    db.session.commit()
    
    return jsonify({'message': 'Object deleted successfully'})

# 로그 관련 라우트
@logs_bp.route('/<int:object_id>/logs', methods=['GET'])
@jwt_required()
def get_object_logs(object_id):
    """객체의 모니터링 로그 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    logs = MonitoringLog.query.filter_by(object_id=object_id).order_by(MonitoringLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs])

@logs_bp.route('/<int:object_id>/logs', methods=['POST'])
@jwt_required()
def create_log(object_id):
    """새 모니터링 로그 생성"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('event_type'):
        return jsonify({'error': 'Event type is required'}), 400
    
    new_log = MonitoringLog(
        object_id=object_id,
        event_type=data['event_type'],
        message=data.get('message', '')
    )
    
    db.session.add(new_log)
    db.session.commit()
    
    return jsonify(new_log.to_dict()), 201

# 알림 관련 라우트
@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """사용자의 알림 목록 조회"""
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).all()
    
    return jsonify([notif.to_dict() for notif in notifications])

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(notification_id):
    """알림을 읽음으로 표시"""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    notification.is_read = True
    db.session.commit()
    
    return jsonify(notification.to_dict())

@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """알림 삭제"""
    user_id = get_jwt_identity()
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    
    if not notification:
        return jsonify({'error': 'Notification not found'}), 404
    
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({'message': 'Notification deleted successfully'})

# 객체 탐지 모니터링 API
@objects_bp.route('/<int:object_id>/monitor', methods=['POST'])
@jwt_required()
def start_monitoring(object_id):
    """객체 모니터링 시작"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    # 모니터링 상태 업데이트
    obj.status = 'monitoring'
    db.session.commit()
    
    return jsonify({
        'message': f'모니터링 시작: {obj.name}',
        'object': obj.to_dict()
    })

@objects_bp.route('/<int:object_id>/detect', methods=['POST'])
@jwt_required()
def process_detection(object_id):
    """객체 탐지 처리 (실제 카메라 프레임 처리)"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    try:
        # 프레임 데이터 받기 (실제로는 카메라에서 받음)
        data = request.get_json()
        frame_data = data.get('frame_data')  # base64 인코딩된 이미지
        
        if not frame_data:
            return jsonify({'error': 'Frame data is required'}), 400
        
        # Base64 이미지를 numpy 배열로 변환
        import base64
        import cv2
        import numpy as np
        
        # Base64 데이터에서 이미지 부분 추출
        if frame_data.startswith('data:image'):
            # "data:image/jpeg;base64," 부분 제거
            frame_data = frame_data.split(',')[1]
        
        # Base64 디코딩
        image_data = base64.b64decode(frame_data)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # 탐지 서비스 호출
        from detection_service import detection_service
        result = detection_service.process_frame(frame, object_id, user_id)
        
        return jsonify({
            'message': '탐지 완료',
            'result': result,
            'object': obj.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': f'탐지 처리 오류: {str(e)}'}), 500

# 수동 탐지 API (기존 upload-image 대체)
@objects_bp.route('/<int:object_id>/manual-detect', methods=['POST'])
@jwt_required()
def manual_detection(object_id):
    """수동 이미지 탐지 (업로드된 이미지로 탐지 수행)"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    try:
        data = request.get_json()
        frame_data = data.get('frame_data')  # base64 인코딩된 이미지
        
        if not frame_data:
            return jsonify({'error': 'Frame data is required'}), 400
        
        # Base64 이미지를 numpy 배열로 변환
        import base64
        import cv2
        import numpy as np
        
        # Base64 데이터에서 이미지 부분 추출
        if frame_data.startswith('data:image'):
            frame_data = frame_data.split(',')[1]
        
        # Base64 디코딩
        image_data = base64.b64decode(frame_data)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # 탐지 서비스 호출 (실제 탐지 수행)
        from detection_service import detection_service
        result = detection_service.process_frame(frame, object_id, user_id)
        
        return jsonify({
            'message': 'Manual detection completed',
            'result': result,
            'object': obj.to_dict()
        })
        
    except Exception as e:
        return jsonify({'error': f'Manual detection error: {str(e)}'}), 500

# 탐지 결과 관련 라우트
@objects_bp.route('/<int:object_id>/detections', methods=['GET'])
@jwt_required()
def get_detection_results(object_id):
    """객체의 탐지 결과 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    # 최근 100개의 탐지 결과 조회
    detections = DetectionResult.query.filter_by(object_id=object_id)\
        .order_by(DetectionResult.created_at.desc())\
        .limit(100).all()
    
    return jsonify([detection.to_dict() for detection in detections])

@objects_bp.route('/<int:object_id>/detections/<int:detection_id>', methods=['GET'])
@jwt_required()
def get_detection_detail(object_id, detection_id):
    """특정 탐지 결과 상세 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    detection = DetectionResult.query.filter_by(id=detection_id, object_id=object_id).first()
    
    if not detection:
        return jsonify({'error': 'Detection result not found'}), 404
    
    return jsonify(detection.to_dict())

@objects_bp.route('/<int:object_id>/detections/stats', methods=['GET'])
@jwt_required()
def get_detection_stats(object_id):
    """객체의 탐지 통계 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    # 위험도별 통계
    danger_stats = db.session.query(
        DetectionResult.danger_level,
        db.func.count(DetectionResult.id)
    ).filter_by(object_id=object_id)\
     .group_by(DetectionResult.danger_level).all()
    
    # 객체 타입별 통계
    class_stats = db.session.query(
        DetectionResult.object_class,
        db.func.count(DetectionResult.id)
    ).filter_by(object_id=object_id)\
     .group_by(DetectionResult.object_class).all()
    
    # 오늘 탐지 개수
    today = datetime.utcnow().date()
    today_count = DetectionResult.query.filter_by(object_id=object_id)\
        .filter(db.func.date(DetectionResult.created_at) == today).count()
    
    return jsonify({
        'danger_level_stats': dict(danger_stats),
        'object_class_stats': dict(class_stats),
        'today_detections': today_count,
        'total_detections': DetectionResult.query.filter_by(object_id=object_id).count()
    })

def create_alert_notification(user_id, object_id, title, message, notification_type='warning'):
    """위험 알림 생성 함수"""
    notification = Notification(
        user_id=user_id,
        object_id=object_id,
        title=title,
        message=message,
        notification_type=notification_type
    )
    
    db.session.add(notification)
    db.session.commit()
    
    # 여기에 실제 알림 전송 로직 추가 (이메일, SMS, 푸시 등)
    print(f"🚨 알림 생성: {title} - {message}")
    
    return notification