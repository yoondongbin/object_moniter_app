import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

def setup_logger(name='object_monitor'):
    """로깅 시스템 설정"""
    
    # 로그 디렉토리 생성
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # 로거 생성
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # 이미 핸들러가 있으면 추가하지 않음
    if logger.handlers:
        return logger
    
    # 포맷터 설정
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # 파일 핸들러 (일별 로테이션)
    file_handler = RotatingFileHandler(
        f'{log_dir}/app.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    
    # 콘솔 핸들러
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # 핸들러 추가
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

def log_detection_event(object_id, danger_level, detected_objects, user_id):
    """탐지 이벤트 로깅"""
    logger = setup_logger('detection')
    
    log_message = f"Detection Event - Object: {object_id}, User: {user_id}, Danger: {danger_level}"
    if detected_objects:
        objects_info = ", ".join([f"{obj['class']}({obj['confidence']:.2f})" for obj in detected_objects])
        log_message += f", Objects: {objects_info}"
    
    if danger_level != 'safe':
        logger.warning(log_message)
    else:
        logger.info(log_message)

def log_api_request(method, endpoint, status_code, user_id=None):
    """API 요청 로깅"""
    logger = setup_logger('api')
    
    log_message = f"API Request - {method} {endpoint} - Status: {status_code}"
    if user_id:
        log_message += f" - User: {user_id}"
    
    if status_code >= 400:
        logger.error(log_message)
    else:
        logger.info(log_message)

def log_error(error_message, error_type="Unknown", user_id=None):
    """에러 로깅"""
    logger = setup_logger('error')
    
    log_message = f"Error - Type: {error_type}, Message: {error_message}"
    if user_id:
        log_message += f" - User: {user_id}"
    
    logger.error(log_message) 