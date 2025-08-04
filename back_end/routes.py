import json
from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Object, MonitoringLog, Notification, DetectionResult
from use_detection_model import use_detection_model
from datetime import datetime
from detection_service import detection_service

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
objects_bp = Blueprint('objects', __name__, url_prefix='/api/objects')
logs_bp = Blueprint('logs', __name__, url_prefix='/api/logs')
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

@objects_bp.route('/', methods=['POST'])
@jwt_required()
def create_object():
    """새로운 객체 생성"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # 필수 필드 검증
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        object_type = data.get('object_type', 'general')  # 기본값 설정
        
        if not name:
            return jsonify({'error': 'Object name is required'}), 400
        
        # 중복 이름 검사 (같은 사용자 내에서)
        existing_object = Object.query.filter_by(
            name=name, 
            user_id=user_id
        ).first()
        
        if existing_object:
            return jsonify({'error': 'Object with this name already exists'}), 400
        
        # 새 객체 생성
        new_object = Object(
            name=name,
            description=description,
            object_type=object_type,
            user_id=user_id,
            status='inactive'  # 기본 상태
        )
        
        db.session.add(new_object)
        db.session.commit()
        
        print(f"✅ 객체 생성 완료: {new_object.to_dict()}")
        
        return jsonify({
            'message': 'Object created successfully',
            'object': new_object.to_dict()
        }), 201
        
    except Exception as e:
        print(f"❌ 객체 생성 오류: {str(e)}")
        db.session.rollback()
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
@logs_bp.route('/<int:object_id>', methods=['GET'])
@jwt_required()
def get_object_logs(object_id):
    """객체의 모니터링 로그 조회"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    logs = MonitoringLog.query.filter_by(object_id=object_id).order_by(MonitoringLog.timestamp.desc()).all()
    return jsonify([log.to_dict() for log in logs])

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

@notifications_bp.route('/send-internal', methods=['POST'])
def send_notification_internal():
    """시스템 내부에서 알림 전송 (JWT 불필요)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        notification_id = data.get('notification_id')
        user_id = data.get('user_id')
        
        if not notification_id or not user_id:
            return jsonify({'error': 'notification_id and user_id are required'}), 400
        
        # 알림 조회
        notification = Notification.query.filter_by(
            id=notification_id, 
            user_id=user_id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        # 알림 전송 처리
        sent_result = detection_service.send_app_notification(notification)
        
        if sent_result:
            # 전송 성공 시 읽음으로 표시
            notification.is_read = True
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': '알림이 성공적으로 전송되었습니다.',
                'notification': {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.notification_type,
                    'sent_at': datetime.utcnow().isoformat()
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': '알림 전송에 실패했습니다.',
                'notification': {
                    'id': notification.id,
                    'title': notification.title,
                    'message': notification.message,
                    'type': notification.notification_type,
                    'sent_at': datetime.utcnow().isoformat()
                }
            }), 500
        
    except Exception as e:
        return jsonify({'error': f'알림 전송 오류: {str(e)}'}), 500

# 객체 탐지 모니터링 API
@objects_bp.route('/<int:object_id>/status', methods=['PUT'])
@jwt_required()
def update_object_status(object_id):
    """객체 상태 변경"""
    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    if obj.status == 'active':
        obj.status = 'inactive'
    else:
        obj.status = 'active'
    
    db.session.commit()
    
    return jsonify({
        'message': f'상태 변경: {obj.name} -> {obj.status}',
        'object': obj.to_dict()
    })

@objects_bp.route('/<int:object_id>/detect', methods=['POST'])
@jwt_required()
def process_detection(object_id):
    """객체 탐지 처리 (Base64 이미지 데이터 처리)"""

    user_id = get_jwt_identity()
    obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
    if not obj:
        return jsonify({'error': 'Object not found'}), 404
    
    try:
        data = request.get_json()
        image_data = data.get('image_data')
        image_format = data.get('image_format', 'jpeg')
        
        if not image_data:
            return jsonify({'error': 'Image data is required'}), 400
        
        # Base64 이미지를 임시 파일로 저장
        import base64
        import cv2
        import numpy as np
        import tempfile
        import os
        
        # Base64 디코딩
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # 임시 파일로 저장
        temp_dir = tempfile.gettempdir()
        temp_filename = f"temp_detection_{object_id}.jpg"
        temp_path = os.path.join(temp_dir, temp_filename)
        
        try:
            # 이미지를 임시 파일로 저장
            cv2.imwrite(temp_path, frame)
            
            # 기존의 detect_object 메서드 사용
            detection_result = use_detection_model.detect_object(temp_path)
            
            if not detection_result:
                return jsonify({'error': 'Detection failed'}), 500
            
            # 탐지 결과를 데이터베이스에 저장
            new_detection_result = {
                'image': image_data,  # Base64 데이터 저장
                'confidence': detection_result.get('confidence', 0.0),
                'class': detection_result.get('class', 'unknown'),
                'detected_object': detection_result.get('detected_object', ''),
                'bbox_coordinates': detection_result.get('bbox_coordinates', {})
            }

            # 탐지 서비스 호출
            from detection_service import detection_service
            result = detection_service.process_frame(new_detection_result, object_id, user_id)
            
            return jsonify({
                'message': '탐지 완료',
                'result': result,
                'object': obj.to_dict()
            })
            
        finally:
            # 임시 파일 삭제
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
    except Exception as e:
        return jsonify({'error': f'탐지 처리 오류: {str(e)}'}), 500

# 수동 탐지 API (기존 upload-image 대체)
# @objects_bp.route('/<int:object_id>/manual-detect', methods=['POST'])
# @jwt_required()
# def manual_detection(object_id):
#     """수동 이미지 탐지 (업로드된 이미지로 탐지 수행)"""
#     user_id = get_jwt_identity()
#     obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
    
#     if not obj:
#         return jsonify({'error': 'Object not found'}), 404
    
#     try:
#         data = request.get_json()
#         frame_data = data.get('frame_data')  # base64 인코딩된 이미지
        
#         if not frame_data:
#             return jsonify({'error': 'Frame data is required'}), 400
        
#         # Base64 이미지를 numpy 배열로 변환
#         import base64
#         import cv2
#         import numpy as np
        
#         # Base64 데이터에서 이미지 부분 추출
#         if frame_data.startswith('data:image'):
#             frame_data = frame_data.split(',')[1]
        
#         # Base64 디코딩
#         image_data = base64.b64decode(frame_data)
#         nparr = np.frombuffer(image_data, np.uint8)
#         frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
#         if frame is None:
#             return jsonify({'error': 'Invalid image data'}), 400
        
#         # 탐지 서비스 호출 (실제 탐지 수행)
#         from detection_service import detection_service
#         result = detection_service.process_frame(frame, object_id, user_id)
        
#         return jsonify({
#             'message': 'Manual detection completed',
#             'result': result,
#             'object': obj.to_dict()
#         })
        
#     except Exception as e:
#         return jsonify({'error': f'Manual detection error: {str(e)}'}), 500

# 탐지 결과 관련 라우트
@objects_bp.route('/detections', methods=['GET'])
@jwt_required()
def get_all_user_detections():
    """사용자의 모든 객체 탐지 정보 조회"""
    user_id = get_jwt_identity()
    
    objects = Object.query.filter_by(user_id=user_id).all()
    
    all_detections = []
    for obj in objects:
        detections = DetectionResult.query.filter_by(object_id=obj.id).all()
        for detection in detections:
            detection_dict = detection.to_dict()
            all_detections.append(detection_dict)
    
    all_detections.sort(key=lambda x: x['created_at'], reverse=True)
    
    return jsonify({
        'success': True,
        'data': all_detections
    })

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

@objects_bp.route('/<int:object_id>/detections/<int:detection_id>', methods=['DELETE'])
@jwt_required()
def delete_detection_result(object_id, detection_id):
    """특정 객체의 특정 탐지 결과 삭제"""
    try:
        user_id = get_jwt_identity()
        
        # 객체 존재 확인 (사용자 소유 확인)
        obj = Object.query.filter_by(id=object_id, user_id=user_id).first()
        if not obj:
            return jsonify({'error': 'Object not found'}), 404
        
        # 탐지 결과 존재 확인
        detection = DetectionResult.query.filter_by(
            id=detection_id, 
            object_id=object_id
        ).first()
        
        if not detection:
            return jsonify({'error': 'Detection result not found'}), 404
        
        # 삭제 전 정보 저장 (응답용)
        detection_info = {
            'id': detection.id,
            'created_at': detection.created_at.isoformat(),
            'confidence': detection.confidence,
            'danger_level': detection.danger_level
        }
        
        # 탐지 결과 삭제
        db.session.delete(detection)
        db.session.commit()
        
        print(f"✅ 탐지 결과 삭제 완료: Object {object_id}, Detection {detection_id}")
        
        return jsonify({
            'message': 'Detection result deleted successfully',
            'deleted_detection': detection_info,
            'object_id': object_id
        }), 200
        
    except Exception as e:
        print(f"❌ 탐지 결과 삭제 오류: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

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
    
    # 서비스 장소별 통계
    class_stats = db.session.query(
        Object.name,
        db.func.count(DetectionResult.id)
    ).join(Object, DetectionResult.object_id == Object.id)\
     .filter(Object.user_id == user_id)\
     .group_by(Object.name).all()
    
    # 오늘 탐지 개수
    today = datetime.utcnow().date()
    today_count = DetectionResult.query.filter_by(object_id=object_id)\
        .filter(db.func.date(DetectionResult.created_at) == today).count()
    
    result_data = {
        'danger_level_stats': dict(danger_stats),
        'object_class_stats': dict(class_stats),
        'today_detections': today_count,
        'total_detections': DetectionResult.query.filter_by(object_id=object_id).count()
    }
    
    return Response(
        json.dumps(result_data, ensure_ascii=False),
        mimetype='application/json'
    )